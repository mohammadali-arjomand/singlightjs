# Singlight
> Singlight3 published :))))))))

# Introduction
Singlight is a light-weight, open-source, free, powerful and easy-to-use Javascript library for creating SPAs. It's a super-light-weight library. `~1KB` for minified file. That's fast and high-performance.
# Example
```js
import { Singlight } from "https://unpkg.com/@mohammadali-arjomand/singlightjs@3.0.0/scripts/singlight.min.js";

class MyApp extends Singlight {
  home = "homeRoute";
  routes = {
    homeRoute: {
        url: "",
        controller: this.homeController
    }
  };
  homeController() {
    return "Welcome to Home";
  }
}
new MyApp().mount("#app");
```
[Click here](https://github.com/mohammadali-arjomand/singlightjs-examples) for see all SinglightJs examples.

# Installation
[Click here](https://github.com/mohammadali-arjomand/singlightjs/wiki/Installation) and choose a installation method and perform

# Documentation
[Click here](https://github.com/mohammadali-arjomand/singlightjs/wiki) for see Documentation.

# License
MIT License - Copyright (c) 2023, MohammadAli Arjomand
