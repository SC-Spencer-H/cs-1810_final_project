# Spencer's CS-1810 Final

## Context
In Windows Explorer, you can right click on a file and select 'Properties' to see various information about the file. In this menu, there is a tab called 'Details', where you can see file-type specific metadata like camera specs or author credit. Many file types have access to a 'Tags' property, which is a semicolon delimited list of arbitrary keywords that can be used to help categorize and index files. I've used this feature for a while with many of my files, especially photos and memes I've saved over the years. When I first started using the feature, the Explorer GUI would helpfully provide a predictive list of tag suggestions to help speed up the tagging process. But at some point a couple years ago, that capability just disappeared after a Windows update. I've continued to use tags since then, but the user experience has been greatly diminished. 

## Pitch
For my final, I'd like to make a prototype file explorer with support for image tag editing to recapture this workflow. I'll create a custom C# API that indexes all the tag names used in a user-given folder and connects to a web-based GUI. The primary features will be basic image browsing, filtering and sorting, and tag editing.

This project will be made possible thanks to a Windows API I found called 'Microsoft.WindowsAPICodePack.Shell'. which has support for manipulation of extended properties of Windows files. The tags are stored as a simple string, delimited by semicolons, so the bulk of the data parsing and handling will by handled in my own API. The Windows API simply allows me to interface with the Windows shell objects so the edits will persist.

## Timeline
The first step of this project will be implementing the basic image browsing features. The API will need to relay what files to display based on the selected folder and any sorting and filtering parameters. The main information that will be need to be communicated is just the file paths and the associated tag string. The site can then use the image path to display it in the DOM and parse the tag string to allow for editing.

Once the GUI and API are hooked up, the next priority is tag editing. An interface for adding and removing tags will be required, and domain logic to store and validate tag entries. Then the service layer will need to relay the changes back to the API. 

Then I'll need to add the predictive tag suggestions, using some kind of tag index plus input events to display suggestions as the user types. When the API is first used, it will need to build the index from scratch by looking at the properties of every image in the folder. After that, new tags will be indexed as they're added. I'm not entirely sure how I'll do the interface for the tag suggestions. Presumably I'll use an html form for adding tags. I'm not sure if the form text input has support for anything like this already, or if I'll have to build my own interface from scratch. 

After I've got all these core features implemented, I can work on adding sorting and filtering so the tags can actually be used for something. This is just a matter of changing what collection of files the API relays to the site in what order based on some input from the user. 

## Requirements
- Filter bar: This slots easily into a image browser project, I was already planning on adding one
- Custom API: A custom API will be very necessary for manipulating the local image files
- API calls: The site will communicate with our custom API frequently to get and update tag data
- Multiple pages: Maybe I could implement this by letting the user view and maybe edit the tag index
- Drag & drop: I could let users drag and drop tags to rearrange the order
- Header, footer, nav: Header and footer are mostly stylistic, the nav could contain links and buttons for tag editing functions

## Todo

### Week 1
- [X] General site structure, header, footer, nav
- [X] API sends paths and tags of all images in folder as JSON
- [X] Site displays all images and tags
### Week 2
- [X] Add form for adding tags
- [X] Add buttons for removing tags
- [X] Domain creates new tag string with all edits
- [X] Service sends new tag string with file path to API
- [X] Add drag and drop for tag order
### Week 3
- [X] API stores tag index as JSON
- [X] API indexes full folder on initialization
- [X] UI searches index on input and provides tag suggestions
- [X] User can select tag suggestions with mouse or keyboard
### Week 4
- [X] Add filter bar, display only files with the filtered tags
- [X] Add sorting options: alphabetical, date added, etc.
- [X] Add nav link to view tag index on separate page
- [X] Target folder of API can be configured

### Additional Goals
- [X] Change metadata editing method
- [X] Remove unused tags from tag index
- [X] Set working folder on any page load
- [X] Resync file data and tag index on any page load
- [X] Add button for manual indexing
- [ ] Validate all post request responses