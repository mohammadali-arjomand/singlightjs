class Singlight {
    constructor(property) {
        this.property = property;
    }

    mount(selector) {
        this.selector = document.querySelector(selector);
        if (this.selector === null) {
            console.log("You should pass a valid selector");
        }
        if (this.property.root === undefined) {
            console.log("You should pass root property");
        }
        if (this.property.home === undefined) {
            console.log("You should pass home property");
        }

        this.current = this.property.root + "/../" + this.property.home;
        this.render();  
    }

    scanner() {
        this.links();
        this.forms();
    }

    links() {
        let links = document.querySelectorAll("a");
        links.forEach((link) => {
            link.addEventListener("click", e => this.routingByLink(e, link.getAttribute("href")));
        });
    }

    routingByLink(event, url) {
        event.preventDefault();
        this.redirect(url);
    }

    forms() {
        let forms = document.querySelectorAll("form");
        forms.forEach((form) => {
            form.addEventListener("submit", e => this.routingByForm(e, form));
        });
    }

    routingByForm(event, form) {
        event.preventDefault();
        let data = new FormData(form);

        if (form.action !== undefined) {
            this.current = this.current + "/../" + form.action;
            this.send(form.action, data);
        }
        else {
            console.log("action is require");
        }
    }

    redirect(url) {
        this.current = this.current + "/../" + url;
        this.render();
    }

    send(to, data) {
        console.log(to);
        async function submit(to, data, parent) {
            try {
                let response = await fetch(to, {
                        method: "POST",
                        body: data
                    });
                let text = await response.text();
                if (response.ok) {
                    parent.innerHTML = text;
                }
                else {
                    console.log("Request failed");
                }
            }
            catch {
                console.log("Request failed");
            }
        }
        submit(to, data, this.selector).then(e => this.scanner());
    }

    render() {
        async function request(url, parent) {
            try {
                let response = await fetch(url);
                let text = await response.text();
                if (response.ok) {
                    parent.innerHTML = text;
                }
                else {
                    console.log("Request failed");
                }
            }
            catch {
                console.log("Request failed2");
            }
        }
        request(this.current, this.selector).then(e => this.scanner());
    }
}
    