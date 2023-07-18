var activePage = null, element = null;

class Page {
    singlight = null;
    route = {};
    root = "";
    names = [];
    token = {
        set(token) { localStorage.setItem("singlightApiTokenManager", token) },
        get() { return localStorage.getItem("singlightApiTokenManager") },
        remove() { localStorage.removeItem("singlightApiTokenManager") },
        check() { return localStorage.getItem("singlightApiTokenManager") === null ? false : true }
    };
    redirect(to) {
        to = to.substring(0,1) !== "/" ? "/" + to : to;
        to = to.substring(0,this.root.length) !== this.root ? this.root + to : to;
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
    template(id) {
        return document.getElementById(id).innerHTML
    }
    title(title) {
        document.title = title;
    }
    render(template) {
        let variables, el;
        template.querySelectorAll("[\\@for]").forEach(e => {
            variables = e.getAttribute("@for").split(" of ");
            for (let i of this[variables[1].trim()]) {
                el = document.createElement(e.nodeName);
                el.innerHTML = e.innerHTML;
                el = e.parentNode.insertBefore(el, e);
                this[variables[0].trim()] = i;
                this.render(el);
            }
            e.parentNode.removeChild(e);
        });

        template.innerHTML = template.innerHTML.replace(/(\{\{.*?\}\})/g, (m,find) => {
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

        template.querySelectorAll("[\\@if]").forEach(e => {            
            if (eval(e.getAttribute("@if"))) {
                e.removeAttribute("@if");
            }
            else {
                e.parentNode.removeChild(e);
            }
        });

        template.querySelectorAll("[\\@display]").forEach(e => {            
            if (!eval(e.getAttribute("@display"))) {
                e.style.display = "none";
            }
            e.removeAttribute("@display");
        });

        let event;
        template.querySelectorAll("[\\@event]").forEach(e => {
            event = e.getAttribute("@event").split(":");
            e.addEventListener(event[0].trim(), e => {this[event[1].trim()](e)});
            e.removeAttribute("@event");
        });

        let route, name, params, passedParams = {};
        template.querySelectorAll("[\\@route]").forEach(e => {
            route = e.getAttribute("@route");
            if (route.trim().substring(0,1) === "_") {
                name = route.split(":")[0];
                name = name.substring(1,name.length);
                params = route.split(":")[1];
                params = params.split(",");
                for (let i in params) {
                    passedParams[params[i].split("=")[0]] = params[i].split("=")[1];
                }
                e.addEventListener("click", () => { this.redirect(this.url(name, passedParams)) });
            }
            else {
                e.addEventListener("click", () => { this.redirect(route) });
            }
            e.removeAttribute("@route");
        });
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
            element.innerHTML = activePage.template();
            activePage.render(element);
        }
    }
}

class Router {
    constructor() {
        this.root = "";
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
    addRoute(uri, page, name=null, accessor=null) {
        uri = uri.substring(uri.length-1, uri.length) !== "/" ? uri + "/" : uri;
        let parsedUri = uri.replace(/(\{.*?\}\/)/g, "(.+?\\/)");
        this.routes.push({uri,page,regex:RegExp(`^${parsedUri}`, "g"),accessor});
        if (name !== null) this.names.push({name,uri});
    }
    addRouteError(error, page) {
        this.notfound = error == 404 ? page : this.notfound;
        this.forbidden = error == 403 ? page : this.forbidden;
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
            if (result.route.accessor !== null && result.route.accessor() === false) {
                if (this.router.forbidden !== null) {
                    activePage = new this.router.forbidden();
                    element.innerHTML = activePage.template();
                    activePage.render(element);
                }
                else {
                    element.innerHTML = "<h1>403 Forbidden</h1>";
                }
            }
            else {
                activePage = new result.route.page();
                activePage.route = result.variables;
                activePage.names = this.router.names;
                activePage.root = this.router.root;
                activePage.singlight = this;
                activePage.setup();
                element.innerHTML = activePage.template();
                activePage.render(element);
            }
        }
        else {
            if (this.router.notfound !== null) {
                activePage = new this.router.notfound();
                element.innerHTML = activePage.template();
                activePage.render(element);
            }
            else {
                element.innerHTML = "<h1>404 Not Found</h1>";
            }
        }
    }
}

export { Page, Reactive, Router, Singlight };