

This is the repository of Charadex, a pokedex-like application, but instead of pokemon you catch chinese characters.

There should be a next.js react typescript app inside webapp that implements the pokedex.

There should be a chrome extension in a folder `extension`. The extension reads out all the text of the webpage and sends it to an endpoint `/api/process_text` in the webapp. Also send the url that the text was found in. Actually, instead of sending the whole page, the users should have to select the text, then right click and select capture in charadex!

For now, assume that it always runs on port localhost:3000. 

The webapp should implement `/api/process_text`. FOr now just leave it empty.

The webapp should have a grid of the 2000 most common chinese characters.

each character has the following information stored on the server:
- How often the character has been seen.
- The pronounciation in pinyin.
- References to the words it occured in


There is an auxiliary words table:
- Word
- meaning in english
- how often it occured
- references to sentences containing the words

There is also a table for sentences:
- Sentence in chinese
- Words it contains
- reference to where it was found

In a second stage, implement the `/api/process_text` endpoint. It should use AI to split up the text into sentences and words, and then use AI to get the data for the tables. There should be a function taking the text and returning the text split up in sentences and then again split up in words.

Then a function that stores the sentences and words into the tables and updates the character seen counts.

For now, just store all tables and data in a json.

For the AI, please use amazon bedrock claud sonnet 4.1.