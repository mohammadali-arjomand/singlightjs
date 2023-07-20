# Singlight
![SINGLIGHT-LOGO](https://s28.picofile.com/file/8466080650/singlight.png)

# Introduction
Singlight is a light-weight, open-source, free, powerful and easy-to-use Javascript library for creating SPAs. It's a super-light-weight library. `~5KB` for minified file. That's fast and high-performance.
# Example
```js
// import requires
import { Singlight, Router, Page } from "https://unpkg.com/@mohammadali-arjomand/singlightjs@4.5.2/scripts/singlight.min.js";

// create home page
class HomePage extends Page {
  template() {
    return "<h1>Hello World</h1>";
  }
}

// set router
const router = new Router();
router.addRoute("/", HomePage);

// create app
const app = new Singlight();
app.router(router);
app.mount("#app");
app.start();
```
[Click here](https://github.com/mohammadali-arjomand/singlightjs-examples) for see all SinglightJs examples.

# Installation
[Click here](https://github.com/mohammadali-arjomand/singlightjs/wiki/Installation) and choose a installation method and perform

# Documentation
[Click here](https://github.com/mohammadali-arjomand/singlightjs/wiki) for see Documentation.

# License
MIT License - Copyright (c) 2023, MohammadAli Arjomand
