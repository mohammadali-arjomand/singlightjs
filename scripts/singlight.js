class Singlight {
    constructor(property) {
        // setting property
        this.property = property;
    }

    mount(selector) {
        console.log("BOOTSTRAPER RUNNED");
        // select element by selector
        this.selector = document.querySelector(selector);

        // check selector is valid
        if (this.selector === null) {
            console.log("You should pass a valid selector");
        }

        // check root is valid
        if (this.property.root === undefined) {
            console.log("You should pass root property");
        }

        // check home is valid
        if (this.property.home === undefined) {
            console.log("You should pass home property");
        }

        // make current location
        this.current = this.property.root + "/" + this.property.home;

        // make history
        this.history = [];

        // bootstrapping lifecycle
        this.urlBuilder(this.current, false);
    }

    urlBuilder(to) {
        console.log("URL BUILDER RUNNED");
        console.log(this.history);

        // update current url
        this.current = to;

        // add to history
        this.history.push(this.current);

        // initial page loader
        this.loader();
    }

    loader() {
        console.log("LOADER RUNNED");
        // make request async function
        async function request(url, self) {
            try {
                // create params
                let params = undefined;

                // check params
                if (self.params !== undefined) {
                    params = {
                        method: "POST",
                        body: self.params
                    };
                }

                // request to url and get page
                let response = await fetch(url, params);
                let text = await response.text();

                // check status
                if (response.ok) {
                    // initial page renderer
                    self.renderer(text);
                }
                else {
                    console.log("Request failed");
                }
            }
            catch {
                console.log("Request failed2");
            }
        }

        // execute request async function
        request(this.current, this);
    }

    renderer(page) {
        console.log("RENDERER RUNNED");
        // rendering page
        this.selector.innerHTML = page;

        // initial page scanner
        this.scanner();
    }

    scanner() {
        console.log("SCANNER RUNNED");
        // scan links
        let links = document.querySelectorAll("a");
        links.forEach((link) => {
            link.addEventListener("click", e => this.eventHandler(e, link));
        });

        // scan forms
        let forms = document.querySelectorAll("form");
        forms.forEach((form) => {
            form.addEventListener("submit", e => this.eventHandler(e, form));
        });
    }

    eventHandler(event, target) {
        console.log("EVENT HANDLER RUNNED");
        // check target tag
        if (event.target.nodeName == "A") {
            // stop refresh
            event.preventDefault();

            // check href is exists
            if (target.href !== undefined) {
                // update params to undefined
                this.params = undefined;
                
                // initial url builder
                this.urlBuilder(target.href, false);
            }
            else {
                // report error
                console.log("href Attribute is require");
            }
        }
        else {
            // stop refresh
            event.preventDefault();

            // check action is exists
            if (target.action !== undefined) {
                // update params to form data object
                this.params = new FormData(target);

                // initial url builder
                this.urlBuilder(target.action, false)
            }
            else {
                // report error
                console.log("action Attribute is require");
            }
        }
    }
}