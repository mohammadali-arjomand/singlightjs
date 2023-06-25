# Singlight
> Singlight2 published :))))))))

# Introduction
Singlight is a light-weight, open-source, free, powerful and easy-to-use Javascript library for creating SPAs. It's a super-light-weight library. `~2KB` for minified file. That's fast and high-performance.
# Example
```js
class MyApp extends Singlight {
  home = "homeRoute";
  routes = {
    homeRoute: { controller: this.homeController }
  };
  homeController() {
    return { page: "homePage" };
  }
}
const myApp = new MyApp();
myApp.mount("#app");
```
[Click here](Unknown) for see all SinglightJs examples.

# Installation
[Click here](https://github.com/mohammadali-arjomand/singlightjs/wiki/Installation) and choose a installation method and perform

# Documentation
[Click here](https://github.com/mohammadali-arjomand/singlightjs/wiki) for see Documentation.

# License
MIT License - Copyright (c) 2023, MohammadAli Arjomand
