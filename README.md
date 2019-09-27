# What Labs Are Open?
Welcome to my labs site. This is a tool meant to help Champlain (specifically, Game Studio) students find a place to work during the day.

## Background

I started the original project in the summer of 2018 for a few reasons. Namely, to keep myself busy in between shifts at a liquor store. But I also wanted to give myself a hand, going into my fourth year, considering I'd never had a GPA greater than 2.8 up to that point. And of course I just blamed that on lacking a place to work during the day. 

Through the menial JavaScript projects I had completed prior, such as my [Nick Magnus Generator](https://old.gabe.ws/nickmagnus) and my [ABV calculator/converter/idek](https://old.gabe.ws/abv?p=24), I started forming a love-hate relationship with the language. And since I'm a bloody masochist, I was hooked. I had a lot of fun throwing the initial labs site together, even if was just a script I attached to [a Tumblr page](https://old.gabe.ws/labs). And I'm glad that others found use (and moderate entertainment) in this tool. However, despite being six credits behind my class, I won't be at Champlain forever (at least, dear Christ I hope not).

In the interest of making this easier to hand off to someone else, I decided to make a static GitHub Pages™ site. In so doing, I've overhauled both the scheduler, and all of my quips into a single-page application. With the way GitHub works, you can just fork this project, enable Pages in the settings, and you'll end up with the same website you see [here](https://labs.gabe.ws), with no actual work necessary.

## Modifying the project

Now, you *could* just edit files in your browser on Github.com and see the changes reflected shortly afterward. Assuming you'd rather see colorful text instead, I'd recommend using [Visual Studio Code](https://code.visualstudio.com/). “Building” the site doesn't require any dependencies other than a web browser, however, debugging will prove to be a challenge, because if you try to run the index.html file outright, you'll be greeted with

```bash
Access to XMLHttpRequest at 'file:///[...]/labs.json' from origin 'null' has been blocked by CORS policy: Cross origin requests are only supported for protocol schemes: http, data, chrome, chrome-extension, https.
```

This is the result of needing to host files on a server in order to actually make AJAX requests. If you are using VS Code, you can download [this hot-loader](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) to resolve this issue easily.

### labs.json
#### Timeslots
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
You'll notice, there isn't a `{"start":1230, "end":1245}` timeslot. This is by design. You *could* include said timeslot without breaking anything, but when I first built this, I decided that I'd rather not bait myself—or anyone else—with only 15 minutes to work while people are entering/leaving a class. The smallest timeslots I include are half an hour long.

#### Description

In addition to timeslots, I also include my own personal commentary on the labs. And by “commentary”, I mean sarcastic remarks that I found funny enough after a couple of Seagram’s Escapes. I have these contained in “description” objects. So long as one includes proper escapes, these strings can contain any valid HTML. Which allows for quite the inline fun:

>"description":"Like its cousin on the block, `<span style='cursor:pointer;' onclick='document.body.click(); window.setTimeout(()=>document.getElementById(\"Joyce 201\").click(), 400)'>`Joyce 201`</span>`, this is a CS PC lab. Woo."

Which essentially makes the span-surrounded, “Joyce 201” act as a link, by simulating a click on the actual element it's referring to.

#### Tier

I have arbitrarily ranked the labs according to relative worth to a member of the Game Studio (more or less). The value of `main` contains the icon that shows up in the upper-left corner of a lab's view. The methodology is as follows:


|Icon | Description |
|-----|-------------|
| <img src="https://www.artstation.com/assets/logo-icon.png" width="48" title="ArtStation logo"/> | PCs that have video cards capable enough (on paper) to run Maya |
| <img src="https://cdn.sstatic.net/Sites/stackoverflow/company/img/logos/so/so-icon.svg?v=f13ebeedfa9e" width="48" title="StackOverflow logo"/> | PCs with lackluster video cards; only really useful for light programming assignments, documentation, and general stuff you can do in a web browser |
| <img src="https://upload.wikimedia.org/wikipedia/commons/7/74/Apple_logo_dark_grey.svg" width=48 title="Apple logo"/>| Macs |

The value for `extra` slides out from the right of the aforementioned icon. The tags contained are used to further explain the tiers. As for the star ratings:

| Stars | Description |
|-------|-------------|
| 3     | has a capable video card and two monitors |
| 2.5   | has a 1080 |
| 2     | has a 1070 (CCM 224) |
| 1.5   | iMacs with X-code (Joyce 210) |
| 1     | iMacs |
| 0.5   | has a GT 210 |

I was debating whether to place the Macs higher or lower than the 💩 tier PC labs. If we're rating by relative worth, the Macs have programs useful for graphic design and making reels installed by default. However, above all else, Unreal can run on a Mac, but it cannot run on a PC with a GT 210, which is what really pushes Macs over the edge for me, personally.

## Debugging

### Querystring

Waiting for hours on end, for the right time or day, to see if something is working as intended is unproductive, and frankly, sounds like a sign of depression out of context. Luckily, I've implemented optional parameters that one can pass into the url to simulate any time or day. The querystring takes the form of 
```
[url]?day=[day of the week (1 = monday)]&time=[military time]
``` 
i.e. https://labs.gabe.ws?day=2&time=1400 yields the open labs on a Tuesday at 2 PM.
