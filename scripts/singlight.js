var activePage = null;
var element = null;

class Page {
    singlight = null;
    route = {};
    root = "/";
    names = [];
    redirect(to) {
        window.history.pushState({}, "", to);
        this.singlight.start();
    }
    url(name, variables) {
        for (let founded of this.names) {
            if (founded.name == name) {
                let url = founded.uri.replace(/(\{.*?\}\/)/g, (m,find) => {
                    return variables[find.substring(1,find.length-2).trim()] + "/";
                });
                return this.root +"/"+ url.substring(1,url.length); 
            }
        }
        return null;
    }
    render() {
        let template = this.template();
        template = template.replace(/(\{\{.*?\}\})/g, (m,find) => {
            find = find.substring(2, find.length-2);
            let
                i,
                parts = find.split("."),
                value = this[parts[0].trim()];
            delete parts[0];
            for (i = 1; i < parts.length; i++) {
                value = value[parts[i].trim()];
            }
            return typeof value === "object" ? value.value : value;
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
        this.names = [];
    }
    setRoot(pathname) {
        pathname = pathname.substring(0,1) !== "/" ? "/" + pathname : pathname;
        pathname = pathname.substring(pathname.length-1,pathname.length) === "/" ? pathname.substring(0,pathname.length-1) : pathname;
        this.root = pathname;
    }
    addRoute(uri, page, name=null) {
        uri = uri.substring(uri.length-1, uri.length) !== "/" ? uri + "/" : uri;
        let parsedUri = uri.replace(/(\{.*?\}\/)/g, "(.+?\\/)");
        this.routes.push({uri,page,regex:RegExp(`^${parsedUri}`, "g")});
        if (name !== null) this.names.push({name,uri});
    }
    addRouteError(error, page) {
        this.notfound = error == 404 ? page : null;
        this.forbidden = error == 403 ? page : null;
    }
    addRouteGroup(prefix, routes) {
        prefix = prefix.substring(0,1) !== "/" ? "/" + prefix : prefix;
        let created = routes(new Router());
        let createdRoutes = created !== undefined ? created.routes : [];
        let createdNames = created !== undefined ? created.names : [];
        for (let i in createdRoutes) {
            let oldRegex = createdRoutes[i].regex.toString();
            if (createdRoutes[i].uri.substring(0,1) !== "/") {
                createdRoutes[i].uri = `${prefix}/${createdRoutes[i].uri}`;
                createdRoutes[i].regex = RegExp(`${prefix}\\/${oldRegex.substring(2,oldRegex.length-2)}`, "g");
            }
            else {
                createdRoutes[i].uri = `${prefix}${createdRoutes[i].uri}`;
                createdRoutes[i].regex = RegExp(`${prefix}${oldRegex.substring(2,oldRegex.length-2)}`, "g");
            }
            if (createdNames[i] !== undefined) {
                if (createdNames[i].uri.substring(0,1) !== "/") {
                    createdNames[i].uri = `${prefix}/${createdNames[i].uri}`;
                }
                else {
                    createdNames[i].uri = `${prefix}${createdNames[i].uri}`;
                }
            }
            this.routes.push(createdRoutes[i]);
            if (createdNames[i] !== undefined) this.names.push(createdNames[i]);
        }
    }
    isMatch(check) {
        for(let route of this.routes) {
            check = check.substring(check.length-1, check.length) !== "/" ? check + "/" : check;
            if (check.replace(route.regex, "") === "") {
                let variables = {};
                let values = check.substring(1, check.length).match(RegExp("(.+?\\/)", "g"));
                let keys = route.uri.substring(1, route.uri.length).match(RegExp("(.+?\\/)", "g"));
                for (let key in keys) {
                    variables[keys[key].substring(1, keys[key].length-2).trim()] = values[key].substring(0, values[key].length-1);
                }
                return {route,variables,names:this.names};
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
        let result = this.router.isMatch(route);
        if(result !== null) {
            activePage = new result.route.page();
            activePage.route = result.variables;
            activePage.names = this.router.names;
            activePage.root = this.router.root;
            activePage.singlight = this;
            activePage.setup();
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

const template = (id) => { return document.getElementById(id).innerHTML };
export { Page, Reactive, Router, Singlight, template };