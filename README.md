# What Labs Are Open?
Welcome to my labs site. This is a tool meant to help Champlain (specifically, Game Studio) students find a place to work during the day.

## Background

I started the original project in the summer of 2018 for a few reasons. Namely, to keep myself busy in between shifts at a liquor store. But I also wanted to give myself a hand, going into my fourth year, considering I'd never had a GPA greater than 2.8 up to that point. And of course I just blamed that on lacking a place to work during the day. 

Through the menial JavaScript projects I had completed prior, such as my [Nick Magnus Generator](https://www.gabe.ws/nickmagnus) and my [ABV calculator/converter/idek](https://gabe.ws/abv?p=24), I started forming a love-hate relationship with the language. And since I'm a bloody masochist, I was hooked. I had a lot of fun throwing the initial labs site together, even if was just a script I attached to [a Tumblr page](https://gabe.ws/labs). And I'm glad that others found use (and moderate entertainment) in this tool. However, despite being six credits behind my class, I won't be at Champlain forever (at least, dear Christ I hope not).

In the interest of making this easier to hand off to someone else, I decided to make a static GitHub Pages™ site. In so doing, I've overhauled both the scheduler, and all of my quips into a single-page application. With the way GitHub works, you can just fork this project, enable Pages in the settings, and you'll end up with the same website you see [here](https://labs.gabe.ws), with no actual work necessary.

## Modifying the project

Now, you *could* just edit files in your browser on Github.com and see the changes reflected shortly afterward. Assuming you'd rather see colorful text instead, I'd recommend using [Visual Studio Code](https://code.visualstudio.com/). "Building" the site doesn't require any dependencies other than a web browser, however, debugging will prove to be a challenge, because if you try to run the index.html file outright, you'll be greeted with

```bash
Access to XMLHttpRequest at 'file:///[...]/labs.json' from origin 'null' has been blocked by CORS policy: Cross origin requests are only supported for protocol schemes: http, data, chrome, chrome-extension, https.
```

This is the result of needing to host files on a server in order to actually make AJAX requests. If you are using VS Code, you can download [this hot-loader](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) to resolve this issue easily.

### labs.json
All of the open timeslots are stored in a json file using military time. It's structured as a list of rooms, each of which containing five days of respective timeslots. **Note**: these are *open* slots, not actual class periods, since knowing what classes are taking place is unnecessary and out of the scope of this project.

As an example, if we start our Thursday morning with Bemis teaching a class at 9:30 until 10:45 with a thirty minute break afterward, we'll have this so far:
```json
[
    ...
    {
        "name":"CCM 222",
        "days":[ 
            ...
            {
                "name": "Thursday",
                "timeslots": [
                    {
                        "start": 0,
                        "end": 930
                    },
                    {
                        "start": 1045,
                        "end": 1115
                    }
``` 
Now, let's say, this upcoming 11:15 class ends at 12:30 but runs back-to-back with the last class of the day starting at 12:45, and running until 2. Following my convention, we'd end up with this:
```json
[
    ...
    {
        "name":"CCM 222",
        "days":[ 
            ...
            {
                "name": "Thursday",
                "timeslots": [
                    {
                        "start": 0,
                        "end": 930
                    },
                    {
                        "start": 1045,
                        "end": 1115
                    },
                    {
                        "start": 1400,
                        "end": 2400,
                    }
``` 
You'll notice, there isn't a `{"start":1230, "end":1245}` timeslot. This is by design. You *could* include said timelot without breaking anything, but when I first built this, I decided that I'd rather not bait myself—or anyone else—with only 15 minutes to work while people are entering/leaving a class. The smallest timeslots I include are half an hour long.