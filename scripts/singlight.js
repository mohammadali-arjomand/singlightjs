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

    redirectors() {
        let redirectors = document.querySelectorAll("redirector");
        redirectors.forEach((redirector) => {
            redirector.addEventListener("click", e => this.redirect(e.target.getAttribute("to")));
        });
    }

    redirect(url) {
        this.current = this.current + "/../" + url;
        this.render();
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
        request(this.current, this.selector).then(e => this.redirectors());
        
    }
}
    