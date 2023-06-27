const URL_BASE = window.location.toString();

class Singlight {
    mount(mountOn) {
        this.lifecycle(this.beforeMounted);
        this.app = document.querySelector(mountOn);
        this.lifecycle(this.afterMounted);
        this.router(this.home);
    }
    router(to, variables=null) {
        this.lifecycle(this.beforeRouted);
        let output, url = URL_BASE + this.routes[to].url;
        if (variables !== null) {
            for (let variable in variables) {
                url = url.replaceAll(`:${variable}:`, variables[variable]);
            }
            output = this.routes[to].controller(variables);
        }
        else {
            output = this.routes[to].controller();
        }
        this.app.innerHTML = output;
        window.history.pushState({}, "", url);
        this.lifecycle(this.afterRouted);
        this.render();
    }
    render() {
        this.lifecycle(this.beforeRendered);
        this.app.querySelectorAll("a").forEach(el => el.addEventListener("click", e => {
            e.preventDefault();
            let data, json = {}, variables = el.getAttribute("variables");
            if (variables !== null) {
                for (let variable of variables.split("|")) {
                    data = variable.split("=");
                    json[data[0]] = data[1];
                }
                this.router(el.getAttribute("route"), json);
            }
            else {
                this.router(el.getAttribute("route"));
            }
        }));
        this.app.querySelectorAll("form").forEach(el => el.addEventListener("submit", e => e.preventDefault()));
        this.app.querySelectorAll("[event]").forEach(el => {
            let eventObj = this.events[el.getAttribute("event")];
            el.addEventListener(eventObj.event, e => {
                let handlerOutput = eventObj.handler(e);
                if (handlerOutput !== undefined) {
                    this.router(handlerOutput.route, handlerOutput.variables !== undefined ? handlerOutput.variables : null);
                }
            });
        });
        this.lifecycle(this.afterRendered);
    }
    lifecycle(func) {
        if (func !== undefined) {
            func();
        }
    }
}
function  template(templateId, variables) {
    let templateInner = document.getElementById(templateId).innerHTML;
    for (let variable in variables) {
        templateInner = templateInner.replaceAll(`:${variable}:`, variables[variable]);
    }
    return templateInner;
}
export {Singlight, template};