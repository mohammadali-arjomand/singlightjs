# Singlight
Singlight is a light-weight, open-source, free, powerfull and easy-to-use Javascript library for creating SPAs

# Why use it?
It's a super-light-weight library. `< 1KB` for minified file. It's very fast and high-performance

# Example
[Click here](https://mohammadali-arjomand.github.io/singlightjs/example/) for see example

# How to install... ?
## with NPM
Install with run this command
```
$ npm i @mohammadali-arjomand/singlightjs
```

## with Git
Clone repository in your project
```
$ git clone https://github.com/mohammadali-arjomand/singlightjs.git
```
and delete every files except `scripts/singlight.min.js`

## with CDN
Use this CDN
```html
<script src="https://unpkg.com/@mohammadali-arjomand/singlightjs@1.0.0/scripts/singlight.min.js"></script>
```

## with File
Download `scripts/singlight.min.js` and use it.

# How to use
First, write your Static-Elements (AppShell) and Dynamic-Element in `index.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Test - Singlight</title>
</head>
<body>
    <!-- Static-Element -->
    <header>Singlight</header>

    <!-- Dynamic-Element -->
    <div id="app"></div>

    <!-- Static-Element -->
    <footer>Copyright (©) 2023 Singlight</footer>
</body>
</html>
```
Now, create your `home.html` file:
```html
<h1>Welcome to first page</h1>
<a href="profile.html">My profile</a>
```
Create your `profile.html` file:
```html
<h1>My prfile</h1>
<a href="home.html">Come back</a>
```
> NOTICE in pages like `home.html` or `profile.html` you shouldn't write HTML template. only create your page

and Now, install Singlight and write this code in your scripts:
```js
const app = new Singlight({
    root: "example.com",
    home: "home.html"
});
app.mount("#app");
``` 
> NOTICE `home` property isn't your `index.html`. It's your first page loaded to dynamic-element like `home.html`