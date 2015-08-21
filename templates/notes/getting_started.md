#Hello there!

Welcome to **Markdown Notes**! This guide will show you some of the tricks Markdown Notes has up its sleeves.

This note is editable, so feel free play with it.

##1. A quick markdown primer

Markdown is a simple formatting language used by Stack Overflow, Github and many other sites. Markdown Notes uses [Github-flavored markdown](https://help.github.com/articles/github-flavored-markdown). 

Since markdown is a standard, the notes you create here will work just fine in other markdown editors.

###1.1. Basic formatting

* **Bold**, *italics* and ~~strikethrough~~ text is easy to create
* [Links](http://markdownnotes.com) and ![images](http://img4me.com/7vS7Tfx.png) are also easy to grasp.
* Titles are created by adding one or more `#`'s at the beginning of the line.
* A single line break creates a second line. Two line breaks create a paragraph.
* Use angled brackets to cite your favorite authors. The standard formatting options also work in citation blocks.
> Markdown Notes is awesome. I use it every day.
>
>*- Abraham Lincoln*

###1.2. Lists

You create lists by adding a `*` at the begining of the line. You can indent your lists by adding spaces before the `*`. You can have multi-line list items as long as you use single line breaks.

* List item 1
* List item 2
	* Sublist 1
    	* Sublist item 1
        * Sublist item 2
    * Sublist 2
* List item 3
List item 3, line 2

Numbered lists are pretty easy to create too:

1. Item one
	1. Subitem one
    2. Subitem two
    
You can also mix lists if you feel like it:

1. List item 1
	* Subitem 1
2. List item 2
	1. Subitem 1
    
You can also create nested to-do lists:

* [x] This one is done
* [ ] This one is not
    * [ ] This is a subtask
    * [ ] Another subtask 
    	* [ ] Do this first
    	* [x] Do this next
* [ ] Neither is this one

###1.3. Code

You can create syntax-highlighted code blocks by using three backticks. The code will be highlighted automatically:

```
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World");
    }
}
```

For `inline code`, use a single backtick.

You can also use four spaces to create code blocks:

	def hello_world:
		print 'Hello, World!'

###1.4. LaTeX

Wrap your LaTeX equations with two `$`'s for inline equations and three `$`'s for equation blocks.

You can create an inline equation for $$3n+\sum_2^n{\pi}$$ or put it in a block:

$$$
3n+\sum_2^n{\pi}
$$$

###1.5. Images

Images can be dragged and dropped over the editor. Alternatively, you can use the standard markdown syntax to insert images.

![](http://i.markdownnotes.com/montreal_xMvtnHZ.jpg)

##2. Markdown Notes features

Markdown Notes provides convenient features that make note-taking easier.

###2.1. Preview and editor modes

Use the *Editor*, *Preview* and *Editor + Preview* modes at the top of the window to toggle the editor and the preview.

###2.2. Full screen mode

Click on the ![](http://i.markdownnotes.com/full-screen.png) icon to put the editor in full screen mode.

###2.2. Printing on paper

All your notes are printable. Print them like any other webpage, and the output will be formatted like a professional document. The markdown code will not show on the printed page.

###2.3. Automatic save

Your notes are saved automatically when you stop typing. 

###2.4. Exporting notes

Click the download button next to a note in the notes menu to export that note to an `.md` file. These text files can be opened by any markdown editor, although unique features such as LaTeX equations might not work.

###2.5. Code folding

Click the small `▾` icons at the left of the editor to collapse the section under them. Click them again to reveal the hidden sections.

###2.6. Keyboard shortcuts

The following standard shortcuts are supported:

* **Bold text:** `Ctrl+B`
* **Italics:** `Ctrl+I`
* **Link:** `Ctrl+K`
* **Image:** `Ctrl+Shift+K`
* **Print:** `Ctrl+P`

###2.7. Multiple cursors

You hold the `Ctrl` or `Cmd` key while selecting text to have multiple cursors. This allows you to edit multiple blocks of text simultaneously.

###2.8. Linking between notes

You can link to another note by using its ID. For instance, [Note #2880](2880) is the same as [Note #2880](http://markdownnotes.com/app/#/?note=2880).