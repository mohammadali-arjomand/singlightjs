let activePage, element; // create global variables

class Page { // create parent class for pages
    token = { // token manager object
        set(token) {
            localStorage.setItem("token", token)
        }, // set token to local storage
        get() {
            return localStorage.getItem("token")
        }, // get token from local storage
        remove() {
            localStorage.removeItem("token")
        }, // remove token from local storage
        check() {
            return localStorage.getItem("token") !== null
        } // check token is exists in local storage
    }

    redirect(to) { // redirect to another routes by url
        to = to.substring(0, 1) !== "/" ? "/" + to : to // add slash before url if is not exists
        to = to.substring(0, this.root.length) !== this.root ? this.root + to : to // add root directory to url if is not exists
        window.history.pushState({}, "", to) // push new url to address bar
        this.singlight.start() // restart loading page
    }

    back() { // redirect back
        window.history.back(); // reload old url
        setTimeout(() => this.singlight.start(), 5) // wait for 0.005 second and restart loading page
    }

    url(name, variables) { // make url by name
        for (let founded of this.names) { // loop for found name
            if (founded.name === name) { // check founded name is passed name
                let url = founded.uri.replace(/(\{.*?\}\/)/g, (m, find) => { // replace { ... } by values
                    return variables[find.substring(1, find.length - 2).trim()] + "/" // find value
                })
                return this.root + "/" + url.substring(1, url.length) // add root before url and return it
            }
        }
        return null // return null if name not defined
    }

    refresh() { // refresh page
        this.element.innerHTML = this.template() // set page template to element
        this.render(this.element) // render page
    }

    title(title) { // title helper
        document.title = title // set new title
    }

    style(name) {
        let link = document.querySelector("link[rel=stylesheet]")
        if (link === null) {
            link = document.createElement("link")
            link.rel = "stylesheet"
            document.head.appendChild(link)
        }
        link.href = `./Styles/${name}.css`;
    }

    elementor(elements) { // elementor helper
        let el = document.createElement(elements.name) // create parent element
        if (elements.attributes !== undefined) { // check attribute was set
            for (let attribute in elements.attributes) { // loop on attributes
                el.setAttribute(attribute, elements.attributes[attribute]); // set attribute
            }
        }
        if (elements.text !== undefined) el.innerHTML = elements.text // set text if is not undefined
        if (elements.children !== undefined) { // check children was set
            for (let i in elements.children) { // loop on children
                el.appendChild(this.elementor(elements.children[i])) // add child
            }
        }
        return el // return created element
    }

    render(template) { // template builder (renderer engine)
        template.querySelectorAll("[sl-for]").forEach(e => { // start loop of every sl-for
            let variables = e.getAttribute("sl-for").split(" of ") // extract for value
            for (let i in eval(variables[1].trim())) { // 'for' for make elements
                let el = document.createElement(e.nodeName) // make new element with main element name
                for (let attr of e.getAttributeNames()) {
                    if (attr !== "sl-for") el.setAttribute(attr, e.getAttribute(attr));
                }
                el.innerHTML = e.innerHTML // set new element inner by main element inner
                el = e.parentNode.insertBefore(el, e) // insert new element before main element
                if (variables[0].includes(":")) { // check arguments contains colon (:)
                    let key = variables[0].split(":")[0].trim() // set key variable name
                    let value = variables[0].split(":")[1].trim() // set value variable name
                    this[key] = i // set key variable value
                    this[value] = this[variables[1].trim()][i] // set value variable value
                } else
                    this[variables[0].trim()] = eval(variables[1].trim())[i] // inject variable value in page class
                el.innerHTML = el.innerHTML.replace(/(\{\{.*?\}\})/g, (m, find) => { // replace {{ ... }} by variable value
                    return eval(find.substring(2, find.length - 2).trim()) // return value
                })
            }
            e.parentNode.removeChild(e) // remove new element
        })

        template.innerHTML = template.innerHTML.replace(/(\{\{.*?\}\})/g, (m, find) => { // replace {{ ... }} by variable value
            return eval(find.substring(2, find.length - 2).trim()) // return value
        })

        const whileForIf = (el, remove) => {
            let removes = []
            while (el !== null) {
                if (el.getAttribute("sl-elif") !== null) {
                    if (!remove) {
                        if (eval(el.getAttribute("sl-elif"))) { // check sl-elif value is true
                            el.removeAttribute("sl-elif")
                            remove = true
                        } else {
                            removes.push(el)
                        }
                    } else {
                        removes.push(el)
                    }
                    el = el.nextElementSibling
                } else if (el.getAttribute("sl-else") !== null) {
                    if (remove) {
                        removes.push(el)
                    } else {
                        el.removeAttribute("sl-else")
                    }
                    break
                } else {
                    break
                }
            }
            for (let rm of removes) {
                rm.remove()
            }
        }

        template.querySelectorAll("[sl-if]").forEach(e => { // find every sl-ifg
            if (eval(e.getAttribute("sl-if"))) { // check sl-if value is true
                e.removeAttribute("sl-if") // remove sl-if attribute
                whileForIf(e.nextElementSibling, true)
            } else {
                if (e.nextElementSibling !== null && e.nextElementSibling.getAttribute("sl-else") !== null) {
                    e.nextElementSibling.removeAttribute("sl-else")
                } else {
                    whileForIf(e.nextElementSibling, false)
                }
                e.parentNode.removeChild(e) // remove sl-if element
            }
        })

        template.querySelectorAll("[sl-display]").forEach(e => { // find every sl-display
            if (!eval(e.getAttribute("sl-display"))) { // check sl-display value is false
                e.style.display = "none" // set display to none
            }
            e.removeAttribute("sl-display") // remove sl-display attribute
        })

        template.querySelectorAll("[sl-on]").forEach(e => { // find every sl-on
            let event = e.getAttribute("sl-on").split(":") // get event type and event handler
            event[0] = event[0].split(".")
            e.addEventListener(event[0][0].trim(), $ => {
                if (event[0][1] === "prevent") {
                    $.preventDefault()
                }
                eval(event[1])
                if (event[0][1] === "refresh") {
                    this.refresh()
                }
            }) // add event listener to sl-on element
            e.removeAttribute("sl-on") // remove sl-on attribute
        })

        template.querySelectorAll("[sl-back]").forEach(e => {
            e.addEventListener("click", () => this.back());
            e.removeAttribute("sl-back");
        })

        template.querySelectorAll("[sl-route]").forEach(e => { // find every sl-route
            let route = e.getAttribute("sl-route") // get route value
            if (route.trim().substring(0, 1) === "_") { // check sl-route value is an url or route name and parameters
                let name = route.split(":")[0] // get name
                name = name.substring(1, name.length) // remove _ from first of name
                let passedParams = {} // define passed parameters variable
                if (route.includes(":")) {
                    let params = route.split(":")[1] // get parameters
                    params = params.split(",") // split parameters
                    for (let i in params) { // loop on the parameters
                        passedParams[params[i].split("=")[0]] = params[i].split("=")[1] // add parameter name and value to passedParams variable
                    }
                }
                e.setAttribute("sl-goto", this.url(name, passedParams)) // set route to singlight goto attribute
            } else {
                e.setAttribute("sl-goto", route) // set route to singlight goto attribute
            }
            e.addEventListener("click", e => {
                e.preventDefault()
                this.redirect(e.target.getAttribute("sl-goto"))
            }) // add event listener to element to redirect when clicked
            e.removeAttribute("sl-route") // remove sl-route attribute
        })

        template.querySelectorAll("[sl-style]").forEach(e => {
            let styles = eval(e.getAttribute("sl-style"))
            for (let style in styles) {
                e.style[style] = styles[style];
            }
        })

        if (this.components !== undefined) { // check component field is exists
            for (let componentName in this.components) { // loop on registered components
                template.querySelectorAll("sl-" + componentName.replace(/Component/i, "")).forEach(e => { //
                    let componentDiv = document.createElement("div") // create parent div
                    let componentAttrs = {} // define component attributes
                    let attributes = "";
                    for (let componentAttr of e.getAttributeNames()) { // loop on attributes
                        if (componentAttr.substring(0, 1) === ":") {
                            componentAttrs[componentAttr.replace(":", "")] = eval(e.getAttribute(componentAttr)) // save result of attribute as params
                            attributes += `${componentAttr.replace(":", "")}="${eval(e.getAttribute(componentAttr))}" `
                        } else {
                            componentAttrs[componentAttr] = e.getAttribute(componentAttr) // save attribute as params
                            attributes += `${componentAttr}="${e.getAttribute(componentAttr)}" `
                        }
                    }
                    e.querySelectorAll("sl-slot[name]").forEach(el => { // find slots
                        componentAttrs[el.getAttribute("name")] = el.innerHTML // set slot inner to params
                        el.parentNode.removeChild(el) // remove slot
                    })
                    componentAttrs.slot = e.innerHTML // set main slot to params
                    componentAttrs.setDefault = (name, value) => { if (componentAttrs[name] === undefined) componentAttrs[name] = value }
                    componentAttrs.attributes = attributes
                    componentDiv.innerHTML = this.components[componentName].apply(componentAttrs) // call component function via params
                    e.parentNode.insertBefore(componentDiv, e) // add created component to component shortcut
                    e.parentNode.removeChild(e) // remove component shortcut
                })
            }
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
        pathname = pathname.substring(0, 1) !== "/" ? "/" + pathname : pathname // add slash before pathname if is not exists
        pathname = pathname.substring(pathname.length - 1, pathname.length) === "/" ? pathname.substring(0, pathname.length - 1) : pathname // remove slash after pathname if is exists
        this.root = pathname // set this.root
    }

    addRoute(uri, page, name = null, accessor = null) { // add route
        uri = uri.substring(uri.length - 1, uri.length) !== "/" ? uri + "/" : uri // add slash after uri if is not exists
        let parsedUri = uri.replace(/(\{.*?\}\/)/g, "(.+?\\/)") // replace { ... } with a regular expression
        this.routes.push({uri, page, regex: RegExp(`^${parsedUri}`, "g"), accessor}) // push route to routes
        if (name !== null) this.names.push({name, uri}) // push name to names if name is not null
    }

    addRouteError(error, page) { // add route error
        this.notfound = error === 404 ? page : this.notfound // add 404 route
        this.forbidden = error === 403 ? page : this.forbidden // add 403 route
    }

    addRouteGroup(prefix, routes) { // add route group
        prefix = prefix.substring(0, 1) !== "/" ? "/" + prefix : prefix // add slash before prefix if is not exists
        let created = routes(new Router()) // call route function, pass router and get it
        let createdRoutes = created !== undefined ? created.routes : [] // get created routes
        let createdNames = created !== undefined ? created.names : [] // get created names
        for (let i in createdRoutes) { // edit created routes
            let oldRegex = createdRoutes[i].regex.toString() // get old created route regex
            if (createdRoutes[i].uri.substring(0, 1) !== "/") { // check slash is before created route uri
                createdRoutes[i].uri = `${prefix}/${createdRoutes[i].uri}` // add prefix and slash before created rouet uri
                createdRoutes[i].regex = RegExp(`${prefix}\\/${oldRegex.substring(2,oldRegex.length-2)}`, "g") // add prefix and slash before created route regex
            } else {
                createdRoutes[i].uri = `${prefix}${createdRoutes[i].uri}` // add prefix before created rouet uri
                createdRoutes[i].regex = RegExp(`${prefix}${oldRegex.substring(2, oldRegex.length - 2)}`, "g") // add prefix before created route regex
            }
            if (createdNames[i] !== undefined) { // check created name is exists
                if (createdNames[i].uri.substring(0, 1) !== "/") { // check slash is before created name uri
                    createdNames[i].uri = `${prefix}/${createdNames[i].uri}` // add prefix and slash before created name uri
                } else {
                    createdNames[i].uri = `${prefix}${createdNames[i].uri}` // add prefix before created name uri
                }
            }
            this.routes.push(createdRoutes[i]) // push this route to this.routes
            if (createdNames[i] !== undefined) this.names.push(createdNames[i]) // push this name to this.names if is exists
        }
    }

    isMatch(check) { // check is match
        for (let route of this.routes) { // loop of routes
            check = check.substring(check.length - 1, check.length) !== "/" ? check + "/" : check // add slash before check if is not exists
            if (check.replace(route.regex, "") === "") { // check 'check' is match by regex
                let variables = {} // initial variables
                let values = check.substring(1, check.length).match(RegExp("(.+?\\/)", "g")) // get values
                let keys = route.uri.substring(1, route.uri.length).match(RegExp("(.+?\\/)", "g")) // get keys
                for (let key in keys) { // loop on keys
                    variables[keys[key].substring(1, keys[key].length - 2).trim()] = values[key].substring(0, values[key].length - 1) // set variable.key to value
                }
                return {route, variables} // return found route and variables
            }
        }
        return null // return null if route not found
    }
}

class Singlight { // singlight (main class)
    router(router) {
        this.router = router // set router
    }

    hooks(hooks) {
        this.hooks = hooks // set hooks
    }

    accessors(accessors) {
        this.accessors = accessors;
    }

    mount(on) {
        element = document.querySelector(on) // set element
    }

    start() { // main method ...
        if (this.hooks.beforeMount !== undefined) this.hooks.beforeMount() // call `before mount` hook if is exists
        let route = window.location.pathname.substring(this.router.root.length, window.location.pathname.length) // get pathname and remove root
        let result = this.router.isMatch(route) // find match router
        const loadPage = (page) => { // create an arrow function for don't repeat code
            activePage = new page() // set active page to customized 403 page
            activePage.route = result.variables // inject route variables (parameters)
            activePage.names = this.router.names // inject names
            activePage.root = this.router.root // inject route
            activePage.singlight = this // inject singlight class
            activePage.element = element // inject mounted element
            if (activePage.setup !== undefined) activePage.setup() // call setup if it's exists
            window.addEventListener("popstate", e => {
                this.start()
            })
            element.innerHTML = activePage.template() // set template to element
            activePage.render(element) // render page
        }
        if (result !== null) { // check result defined
            let accessor = result.route.accessor
            if (typeof accessor === "string") accessor = accessor.split(",")
            if (accessor !== null && typeof accessor === "object") {
                let activeAccessors = []
                for (let theAccessor of accessor) {
                    for (let registeredAccessor in this.accessors) {
                        if (theAccessor.toLowerCase() === registeredAccessor.replace(/Accessor/i, "").toLowerCase()) {
                            activeAccessors.push(this.accessors[registeredAccessor])
                        }
                    }
                }
                accessor = () => {
                    for (let activeAccessor of activeAccessors) {
                        if (activeAccessor() === false) {
                            return false
                        }
                    }
                    return true
                }
            }
            if (accessor !== null && accessor() === false) { // check accessor is defined and it's false
                if (this.router.forbidden !== undefined) { // check customized 403 is exists
                    loadPage(this.router.forbidden) // make forbidden page
                } else {
                    element.innerHTML = "<h1>403 Forbidden</h1>" // show default 403 page
                }
            } else { // accessor is true
                loadPage(result.route.page) // make normal page
            }
        } else { // result is not defined
            if (this.router.notfound !== undefined) { // check customized 404 is exists
                loadPage(this.router.notfound) // make notfound page
            } else {
                element.innerHTML = "<h1>404 Not Found</h1>" // show default 404 page
            }
        }
        if (this.hooks.afterMount !== undefined) this.hooks.afterMount() // call `after mount` hook if is exists
    }
}

export default Singlight // export Singlight class as default
export {Page, Router} // export other classes