class Singlight {
    mount(selector) {
        this.app = document.querySelector(selector);
        document.querySelectorAll("page").forEach(page => {
            page.style.display = "none";
        });
        document.querySelectorAll("component").forEach(component => {
            component.style.display = "none";
        });
        this.router(this.home);
    }
     router(routeName, route) {
        this.activeRoute = routeName;
        if (this.routes[routeName].api === undefined) {
            this.controllers(this.routes[routeName].controller);
        }
        else {
            this.sendRequest(route);
        }
    }
    sendRequest(route) {
        console.log("Request sending")
        async function send(url, method, self) {
            let response = await fetch(url, {
                method: method
            });
            let json = await response.json();
            if (response.ok) {
                self.controllers(self.routes[self.activeRoute].controller, json);
            }
        }

        let router = this.apiBuilder(this.routes[this.activeRoute].api, JSON.parse(route.getAttribute("vars")));
        send(router, this.routes[this.activeRoute].method, this);
    }
    apiBuilder(url, variables) {
        let variable;
        for (variable in variables) {
            url = url.replaceAll("::" + variable, variables[variable]);
        }
        return url;
    }
    controllers(ctrlr, params=null) {
        if (params === null) {
            this.data = ctrlr();
        }
        else {
            this.data = ctrlr(params);
        }
        this.pageSwitcher();
    }
    pageSwitcher() {
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
    pageRender() {
        let variables = this.data.compact;
        if (variables !== undefined) {
            let variable;
            for (variable in variables) {
                this.app.innerHTML = this.app.innerHTML.replaceAll("::" + variable, variables[variable]);
            }
        }
        this.routeTagScanner();
    }
    routeTagScanner() {
        this.app.querySelectorAll("route").forEach(oneRoute => {
            oneRoute.addEventListener("click", e => this.router(oneRoute.getAttribute("to"), oneRoute));
        });
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