var activePage = null;
var activeRoute = null;
var element = null;
var routeInfo = {
    variables:{}
};

class Page {
    render() {
        let template = this.template();
        template = template.replace(/(\{\{.*?\}\})/g, (m,find) => {
            find = find.substring(2, find.length-2);
            let
                variable,
                i,
                parts = find.split("."),
                value = typeof this[parts[0].trim()] === "object" ? this[parts[0].trim()].value : this[parts[0].trim()];
            delete parts[0];
            for (i = 1; i < parts.length; i++) {
                value = value[parts[i].trim()];
            }
            return value;
        });
        return template;
    }
}

class Reactive {
    constructor(value) {
        this.value = value;
    }
    get value() {
        return this._value;
    }
    set value(value) {
        this._value = value;
        if (activePage !== null) {
            element.innerHTML = activePage.render();
        }
    }
}

class Router {
    constructor() {
        this.root = "/";
        this.notfound = null;
        this.forbidden = null;
        this.routes = [];
    }
    setRoot(pathname) {
        if (pathname.substring(0, 1) !== "/") {
            pathname = "/" + pathname;
        }
        this.root = pathname;
    }
    addRoute(uri, page) {
        if (uri.substring(uri.length-1, uri.length) !== "/") {
            uri += "/";
        }
        let parsedUri = uri.replace(/(\{.*?\}\/)/g, "(.+?\\/)");
        this.routes.push({uri,page,regex:RegExp(`^${parsedUri}`, "g"),parsedUri});
    }
    addRouteError(error, page) {
        if (error == 404) {
            this.notfound = page;
        }
        else if (error == 403) {
            this.forbidden = page;
        }
    }
    isMatch(check) {
        for(let route of this.routes) {
            if (check.substring(check.length-1, check.length) !== "/") {
                check += "/";
            }
            if (check.replace(route.regex, "") === "") {
                activeRoute = route;
                let values = check.substring(1, check.length).match(RegExp("(.+?\\/)", "g"));
                let keys = route.uri.substring(1, route.uri.length).match(RegExp("(.+?\\/)", "g"));
                for (let key in keys) {
                    routeInfo.variables[keys[key].substring(1, keys[key].length-2)] = values[key].substring(0, values[key].length-1);
                }
                return route.page;
            }
        }
        return null;
    }
}

class Singlight {
    router(router) {
        this.router = router;
    }
    mount(on) {
        this.element = on;
        element = document.querySelector(this.element);
    }
    start() {
        let route = window.location.pathname.substring(this.router.root.length, window.location.pathname.length);
        let page = this.router.isMatch(route);
        if(page !== null) {
            activePage = new page();
            element.innerHTML = activePage.render();
        }
        else {
            if (this.router.notfound !== null) {
                activePage = new this.router.notfound();
                element.innerHTML = activePage.render();    
            }
            else {
                element.innerHTML = "<h1>404 Not Found</h1>";
            }
        }
    }
}

export { Page, Reactive, Router, Singlight, routeInfo };