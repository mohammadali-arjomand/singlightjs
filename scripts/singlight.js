class Singlight {
    mount(selector) {
        this.app = document.querySelector(selector);
        document.querySelectorAll("page").forEach(page => {
            page.style.display = "none";
        });
        document.querySelectorAll("component").forEach(component => {
            component.style.display = "none";
        });
        document.querySelectorAll("loader").forEach(component => {
            component.style.display = "none";
        });
        this.router(this.home);
    }
     router(routeName, target=null, formData=null) {
        this.toggleLoader();
        this.activeRoute = routeName;
        if (this.routes[routeName].api === undefined) {
            this.controllers(this.routes[routeName].controller);
        }
        else {
            if (target !== null && target.getAttribute("vars") !== null) {
                if (formData === null) {
                    this.sendRequest(JSON.parse(target.getAttribute("vars")));
                }
                else {
                    this.sendRequest(JSON.parse(target.getAttribute("vars")), formData);
                }
            }
            else {
                if (formData === null) {
                    this.sendRequest();
                }
                else {
                    this.sendRequest(null, formData);
                }
            }
        }
    }
    controllers(ctrlr, params=null) {
        if (params === null) {
            this.data = ctrlr();
        }
        else {
            this.data = ctrlr(params);
        }
        this.toggleLoader();
        this.pageSwitcher();
    }
    sendRequest(variables=null, formData=null) {
        async function send(url, self, formData=null) {
            let response;
            if (formData === null) {
                response = await fetch(url);
            }
            else {
                response = await fetch(url, {
                    method: "POST",
                    body: formData
                });
            }
            let json = await response.json();
            if (response.ok) {
                self.controllers(self.routes[self.activeRoute].controller, json);
            }
        }

        let router = this.routes[this.activeRoute].api;
        if (variables !== null) {
            router = this.apiBuilder(router, variables);
        }
        if (formData === null) {
            send(router, this);
        }
        else {
            send(router, this, formData);
        }
    }
    apiBuilder(url, variables) {
        let variable;
        for (variable in variables) {
            url = url.replaceAll("::" + variable, variables[variable]);
        }
        return url;
    }
    pageSwitcher() {
        if (this.data.redirect === undefined) {
            let page = document.querySelector("page[name=" + this.data.page + "]");
            if (this.data.title !== undefined) {
                document.title = this.data.title;
            }
            else if (page.getAttribute("title") !== null) {
                document.title = page.getAttribute("title");
            }
            this.app.innerHTML = page.innerHTML;
            this.pageRender();
        }
        else {
            if (this.data.variables !== undefined) {
                let virtualRoute = document.createElement("route");
                virtualRoute.setAttribute("vars", JSON.stringify(this.data.variables));
                this.router(this.data.redirect, virtualRoute);
            }
            else {
                this.router(this.data.redirect);
            }
        }
    }
    pageRender() {
        let variables = this.data.compact;
        if (variables !== undefined) {
            let variable;
            for (variable in variables) {
                this.app.innerHTML = this.app.innerHTML.replaceAll("::" + variable, variables[variable]);
            }
        }
        this.pageScanner();
    }
    pageScanner() {
        this.app.querySelectorAll("route").forEach(oneRoute => {
            oneRoute.addEventListener("click", e => this.router(oneRoute.getAttribute("to"), oneRoute));
        });
        this.app.querySelectorAll("form[route]").forEach(oneForm => {
            oneForm.addEventListener("submit", e => this.pageForms(e, oneForm));
        });
    }
    pageForms(e, form) {
        e.preventDefault();
        let formData = new FormData(form);
        this.router(form.getAttribute("route"), form, formData);
    }
    toggleLoader() {
        let loader = document.querySelector("loader");
        if (loader !== null) {
            if (loader.style.display === "none") {
                loader.style.display = "block";
            }
            else {
                loader.style.display = "none";
            }
        }
    }
}

class Component {
    constructor() {
        this.output = "";
    }
    add(componentName, variables) {
        let componentInner = document.querySelector("component[name=" +componentName+ "]").innerHTML;
        let variable;
        for (variable in variables) {
            componentInner = componentInner.replaceAll("::" + variable, variables[variable]);
        }
        this.output += componentInner;
    }
    get() {
        return this.output;
    }
}