var activePage = null, element = null // create global variables

class Page { // create parent class for pages
    token = { // token manager object
        set(token) { localStorage.setItem("singlightApiTokenManager", token) }, // set token to local storage
        get() { return localStorage.getItem("singlightApiTokenManager") }, // get token from local storage
        remove() { localStorage.removeItem("singlightApiTokenManager") }, // remove token from local storage
        check() { return localStorage.getItem("singlightApiTokenManager") === null ? false : true } // check token is exists in local storage
    }
    redirect(to) { // redirect to another routes by url
        to = to.substring(0,1) !== "/" ? "/" + to : to // add slash before url if is not exists
        to = to.substring(0,this.root.length) !== this.root ? this.root + to : to // add root directory to url if is not exists
        window.history.pushState({}, "", to) // push new url to addressbar
        this.singlight.start() // restart loading page
    }
    back() { // redirect back
        window.history.back(); // reload old url
        setTimeout(() => this.singlight.start(), 5) // wait for 0.005 second and restart loading page
    }
    url(name, variables) { // make url by name
        for (let founded of this.names) { // loop for found name
            if (founded.name == name) { // check founded name is passed name
                let url = founded.uri.replace(/(\{.*?\}\/)/g, (m,find) => { // replace { ... } by values
                    return variables[find.substring(1,find.length-2).trim()] + "/" // find value
                })
                return this.root +"/"+ url.substring(1,url.length) // add root before url and return it
            }
        }
        return null // return null if name not defined
    }
    load(id) { // load template helper
        return document.getElementById(id).innerHTML // find template and return inner of template
    }
    refresh() {
        this.singlight.start()
    }
    title(title) { // title helper
        document.title = title // set new title
    }
    elementor(elements) {
        let el = document.createElement(elements.name)
        if (elements.attributes !== undefined) {
            for (let attribute in elements.attributes) {
                el.setAttribute(attribute, elements.attributes[attribute]);
            }
        }
        if (elements.text !== undefined) el.innerHTML = elements.text
        if (elements.children !== undefined) {
            for (let i in elements.children) {
                el.appendChild(this.elementor(elements.children[i]))
            }
        }
        return el
    }
    render(template) { // template builder (renderer engine)
        let variables, el // initial for variables (parameters) and new element builded
        template.querySelectorAll("[\\@for]").forEach(e => { // start loop of every @for
            variables = e.getAttribute("@for").split(" of ") // extract for value
            for (let i of this[variables[1].trim()]) { // really 'for' for make elements
                el = document.createElement(e.nodeName) // make new element with main element name
                el.innerHTML = e.innerHTML // set new element inner by main element inner
                el = e.parentNode.insertBefore(el, e) // insert new element before main element
                this[variables[0].trim()] = i // inject variable value in page class
                this.render(el) // render new element
            }
            e.parentNode.removeChild(e) // remove new element
        })

        template.querySelectorAll("[\\@template]").forEach(e => { // loop of every @template
            e.innerHTML = this.load(e.getAttribute("@template")) // load template
        })

        template.innerHTML = template.innerHTML.replace(/(\{\{.*?\}\})/g, (m,find) => { // replace {{ ... }} by variable value
            find = find.substring(2, find.length-2) // remove '{{' and '}}' from finded
            let // create some variables
                i, // i variable for loop
                parts = find.split("."), // split variable name for access to object
                value = this[parts[0].trim()] // initial value of variable
            delete parts[0] // delete first part for it set added to value
            for (i = 1; i < parts.length; i++) { // loop for find latest value (if value of variable is object)
                value = value[parts[i].trim()] // set a value to value variable
            }
            return typeof value === "object" ? value.value : value // if it's a object (Reactive variable) return .value if not return self value
        })

        template.querySelectorAll("[\\@if]").forEach(e => { // find every @if
            if (eval(e.getAttribute("@if"))) { // check @if value is true
                e.removeAttribute("@if") // remove @if attribute
            }
            else {
                e.parentNode.removeChild(e) // remove @if element
            }
        })

        template.querySelectorAll("[\\@display]").forEach(e => { // find every @display           
            if (!eval(e.getAttribute("@display"))) { // check @display value is false
                e.style.display = "none" // set display to none
            }
            e.removeAttribute("@display") // remove @display attribute
        })

        let event // initial event variable for @event
        template.querySelectorAll("[\\@event]").forEach(e => { // find every @event
            event = e.getAttribute("@event").split(":") // get event type and event handler
            e.addEventListener(event[0].trim(), e => this[event[1].trim()](e)) // add event listener to @event element
            e.removeAttribute("@event") // remove @event attribute
        })

        template.querySelectorAll("[\\@back]").forEach(e => {
            e.addEventListener("click", () => this.back());
            e.removeAttribute("@back");
        })

        let route, name, params, passedParams = {} // initial route for get @route, name for route-name, params for route parameters, passesParams for convert params to object
        template.querySelectorAll("[\\@route]").forEach(e => { // find every @route
            route = e.getAttribute("@route") // get route value
            if (route.trim().substring(0,1) === "_") { // check @route value is a url or route name and parameters
                name = route.split(":")[0] // get name
                name = name.substring(1,name.length) // remove _ from first of name
                if (route.includes(":")) {
                    params = route.split(":")[1] // get parameters
                    params = params.split(",") // split parameters
                    for (let i in params) { // loop on the parameters
                        passedParams[params[i].split("=")[0]] = params[i].split("=")[1] // add parameter name and value to passedParams variable
                    }
                }
                e.addEventListener("click", () => { this.redirect(this.url(name, passedParams)) }) // add event listener to element to redirect when clicked
            }
            else {
                e.addEventListener("click", () => { this.redirect(route) }) // add event listener to element to redirect when clicked
            }
            e.removeAttribute("@route") // remove @route attribute
        })
    }
}

class Reactive { // reactivity class
    constructor(value) {
        this.value = value // initial set value
    }
    get value() {
        return this._value // value getter
    }
    set value(value) {
        this._value = value // value setter
        if (activePage !== null) { // check a page is active to rebuild this page
            element.innerHTML = activePage.template() // set page template to element
            activePage.render(element) // render page
        }
    }
}

class Router { // create router
    root = "";
    constructor() {
        this.routes = [] // initial routes 
        this.names = [] // initial names
    }
    setRoot(pathname) { // s method for set root of routes
        pathname = pathname.substring(0,1) !== "/" ? "/" + pathname : pathname // add slash before pathname if is not exists
        pathname = pathname.substring(pathname.length-1,pathname.length) === "/" ? pathname.substring(0,pathname.length-1) : pathname // remove slash after pathname if is exists
        this.root = pathname // set this.root
    }
    addRoute(uri, page, name=null, accessor=null) { // add route
        uri = uri.substring(uri.length-1, uri.length) !== "/" ? uri + "/" : uri // add slash after uri if is not exists
        let parsedUri = uri.replace(/(\{.*?\}\/)/g, "(.+?\\/)") // replace { ... } with a regular expression
        this.routes.push({uri,page,regex:RegExp(`^${parsedUri}`, "g"),accessor}) // push route to routes
        if (name !== null) this.names.push({name,uri}) // push name to names if name is not null
    }
    addRouteError(error, page) { // add route error
        this.notfound = error == 404 ? page : this.notfound // add 404 route
        this.forbidden = error == 403 ? page : this.forbidden // add 403 route
    }
    addRouteGroup(prefix, routes) { // add route group
        prefix = prefix.substring(0,1) !== "/" ? "/" + prefix : prefix // add slash before prefix if is not exists
        let created = routes(new Router()) // call route function, pass router and get it
        let createdRoutes = created !== undefined ? created.routes : [] // get created routes
        let createdNames = created !== undefined ? created.names : [] // get created names
        for (let i in createdRoutes) { // edit created routes
            let oldRegex = createdRoutes[i].regex.toString() // get old created route regex
            if (createdRoutes[i].uri.substring(0,1) !== "/") { // check slash is before created route uri
                createdRoutes[i].uri = `${prefix}/${createdRoutes[i].uri}` // add prefix and slash before created rouet uri
                createdRoutes[i].regex = RegExp(`${prefix}\\/${oldRegex.substring(2,oldRegex.length-2)}`, "g") // add prefix and slash before created route regex
            }
            else {
                createdRoutes[i].uri = `${prefix}${createdRoutes[i].uri}` // add prefix before created rouet uri
                createdRoutes[i].regex = RegExp(`${prefix}${oldRegex.substring(2,oldRegex.length-2)}`, "g") // add prefix before created route regex
            }
            if (createdNames[i] !== undefined) { // check created name is exists
                if (createdNames[i].uri.substring(0,1) !== "/") { // check slash is before created name uri
                    createdNames[i].uri = `${prefix}/${createdNames[i].uri}` // add prefix and slash before created name uri
                }
                else {
                    createdNames[i].uri = `${prefix}${createdNames[i].uri}` // add prefix before created name uri
                }
            }
            this.routes.push(createdRoutes[i]) // push this route to this.routes
            if (createdNames[i] !== undefined) this.names.push(createdNames[i]) // push this name to this.names if is exists
        }
    }
    isMatch(check) { // check is match
        for(let route of this.routes) { // loop of routes
            check = check.substring(check.length-1, check.length) !== "/" ? check + "/" : check // add slash before check if is not exists
            if (check.replace(route.regex, "") === "") { // check 'check' is match by regex
                let variables = {} // initial variables
                let values = check.substring(1, check.length).match(RegExp("(.+?\\/)", "g")) // get values
                let keys = route.uri.substring(1, route.uri.length).match(RegExp("(.+?\\/)", "g")) // get keys
                for (let key in keys) { // loop on keys
                    variables[keys[key].substring(1, keys[key].length-2).trim()] = values[key].substring(0, values[key].length-1) // set variable.key to value
                }
                return {route,variables} // return finded route and variables
            }
        }
        return null // return null if route not found
    }
}

class Singlight { // singlight (main class)
    router(router) {
        this.router = router // set router
    }
    mount(on) {
        element = document.querySelector(on) // set element
    }
    start() { // main method ...
        let route = window.location.pathname.substring(this.router.root.length, window.location.pathname.length) // get pathname and remove root
        let result = this.router.isMatch(route) // find match router
        if(result !== null) { // check result defined
            if (result.route.accessor !== null && result.route.accessor() === false) { // check accessor is defined and it's false
                if (this.router.forbidden !== undefined) { // check customized 403 is exists
                    activePage = new this.router.forbidden() // set active page to customized 403 page
                    element.innerHTML = activePage.template() // set template to element
                    activePage.render(element) // render page
                }
                else {
                    element.innerHTML = "<h1>403 Forbidden</h1>" // show default 403 page
                }
            }
            else { // accessor is true
                activePage = new result.route.page() // set active page to route page
                activePage.route = result.variables // inject route variables (parameters)
                activePage.names = this.router.names // inject names
                activePage.root = this.router.root // inject route
                activePage.singlight = this // inject singlight class
                if (activePage.setup !== undefined) activePage.setup() // call setup if it's exists
                element.innerHTML = activePage.template() // set template to element
                activePage.render(element) // render page
            }
        }
        else { // result is not defined
            if (this.router.notfound !== undefined) { // check customized 404 is exists
                activePage = new this.router.notfound() // set active page to customized 404 page
                element.innerHTML = activePage.template() // set template to element
                activePage.render(element) // render page
            }
            else {
                element.innerHTML = "<h1>404 Not Found</h1>" // show default 404 page
            }
        }
    }
}

export { Page, Reactive, Router, Singlight } // export classes