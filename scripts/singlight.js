// main class
class Singlight {
    // start works
    mount(selector) {
        // select app element
        this.app = document.querySelector(selector);
        // hidden page tags
        document.querySelectorAll("page").forEach(page => {
            page.style.display = "none";
        });
        // hidden component tags
        document.querySelectorAll("component").forEach(component => {
            component.style.display = "none";
        });
        // hidden loader
        document.querySelectorAll("loader").forEach(loader => {
            loader.style.display = "none";
        });
        // call router
        this.router(this.home);
    }
    // application router
     router(routeName, target=null, formData=null) {
        // open loader page
        this.toggleLoader();
        // set active route name
        this.activeRoute = routeName;
        // check route has api or not
        if (this.routes[routeName].api === undefined) {
            // call controller if route hasn't api
            this.controllers(this.routes[routeName].controller);
        }
        else {
            // check target and variables is valid
            if (target !== null && target.getAttribute("vars") !== null) {
                // check form data is invalid
                if (formData === null) {
                    // call send request method and pass variables
                    this.sendRequest(JSON.parse(target.getAttribute("vars")));
                }
                else {
                    // call send request method and pass variables with form data
                    this.sendRequest(JSON.parse(target.getAttribute("vars")), formData);
                }
            }
            else {
                // check form data is invalid
                if (formData === null) {
                    // call send request method
                    this.sendRequest();
                }
                else {
                    // call send request method and pass form data
                    this.sendRequest(null, formData);
                }
            }
        }
    }
    // send ajax request with fetch api
    sendRequest(variables=null, formData=null) {
        // create async send function
        async function send(url, self, formData=null) {
            // create response variable
            let response;
            // check form data is invalid
            if (formData === null) {
                // fetch with url
                response = await fetch(url);
            }
            else {
                // fetch with url and form data
                response = await fetch(url, {
                    method: "POST",
                    body: formData
                });
            }
            // make json
            let json = await response.json();
            // check request is valid
            if (response.ok) {
                // call controller and pass controller method and json data
                self.controllers(self.routes[self.activeRoute].controller, json);
            }
        }
        // find static router
        let router = this.routes[this.activeRoute].api;
        // check variables is valid
        if (variables !== null) {
            // call api url builder function for convert api pattern to real url
            router = this.apiBuilder(router, variables);
        }
        // check form data is invalid
        if (formData === null) {
            // call async send function without form data
            send(router, this);
        }
        else {
            // call async send function with form data
            send(router, this, formData);
        }
    }
    // api builder helper method
    apiBuilder(url, variables) {
        // create 'variable' variable
        let variable;
        // loop on variables
        for (variable in variables) {
            // replace variable symbol to variable value
            url = url.replaceAll("::" + variable, variables[variable]);
        }
        // return created url
        return url;
    }
    // controller caller method
    controllers(ctrlr, params=null) {
        // check controller has parameter
        if (params === null) {
            // call controller and set output to data variable
            this.data = ctrlr();
        }
        else {
            // call controller with parameter and set output to data variable
            this.data = ctrlr(params);
        }
        // close loader page
        this.toggleLoader();
        // call page switcher
        this.pageSwitcher();
    }
    // page switcher method
    pageSwitcher() {
        // check redirect is invalid
        if (this.data.redirect === undefined) {
            // find page
            let page = document.querySelector("page[name=" + this.data.page + "]");
            // check title data is valid
            if (this.data.title !== undefined) {
                // setting title
                document.title = this.data.title;
            }
            // check title attribute is valid
            else if (page.getAttribute("title") !== null) {
                // setting title
                document.title = page.getAttribute("title");
            }
            // switch page to new page
            this.app.innerHTML = page.innerHTML;
            // call page renderer
            this.pageRender();
        }
        else {
            // check variables is valid
            if (this.data.variables !== undefined) {
                // make virtual route element
                let virtualRoute = document.createElement("route");
                virtualRoute.setAttribute("vars", JSON.stringify(this.data.variables));
                // call router with virtual route element
                this.router(this.data.redirect, virtualRoute);
            }
            // variables is invalid
            else {
                // call router without route element
                this.router(this.data.redirect);
            }
        }
    }
    // page renderer method
    pageRender() {
        // get compacted data
        let variables = this.data.compact;
        // check variables is valid
        if (variables !== undefined) {
            // create 'variable' variable
            let variable;
            // loop on variables
            for (variable in variables) {
                // replace variable symbol to variable value
                this.app.innerHTML = this.app.innerHTML.replaceAll("::" + variable, variables[variable]);
            }
        }
        this.pageScanner();
    }
    // page scanner method
    pageScanner() {
        // add click event to route tags
        this.app.querySelectorAll("route").forEach(oneRoute => {
            // set when clicked call router with url and route
            oneRoute.addEventListener("click", e => this.router(oneRoute.getAttribute("to"), oneRoute));
        });
        // add submit event to form tags with route attribute
        this.app.querySelectorAll("form[route]").forEach(oneForm => {
            // set when submitted call page form method with event and form
            oneForm.addEventListener("submit", e => this.pageForms(e, oneForm));
        });
    }
    // page forms method
    pageForms(e, form) {
        // don't submit form
        e.preventDefault();
        // make form data object
        let formData = new FormData(form);
        // call router with url, form html-element and form data
        this.router(form.getAttribute("route"), form, formData);
    }
    // toggle loader method
    toggleLoader() {
        // find loader
        let loader = document.querySelector("loader");
        // check loader is valid
        if (loader !== null) {
            // check loader is disable
            if (loader.style.display === "none") {
                // enable loader
                loader.style.display = "block";
            }
            // check loader is enable
            else {
                // disable loader
                loader.style.display = "none";
            }
        }
    }
}

// component manager class
class Component {
    // construct
    constructor() {
        // create output variable
        this.output = "";
    }
    // component adder method
    add(componentName, variables) {
        // find component inner html
        let componentInner = document.querySelector("component[name=" +componentName+ "]").innerHTML;
        // make 'variable' variable
        let variable;
        // loop on variables
        for (variable in variables) {
            // replace variable symbol to variable value
            componentInner = componentInner.replaceAll("::" + variable, variables[variable]);
        }
        // append rendered component to output variable
        this.output += componentInner;
    }
    // output getter
    get() {
        // return output variable
        return this.output;
    }
}