# Theme Generation

In addition to the builtin themes,
the game device provides two other methods of selecting additional themes.

If connected to the internet, new themes can be downloaded using either of these methods.
If not connected to the internet, game play is limited to the built-in themes and those previously downloaded using these methods.

## Searching the Library

The user can browse or search the library of themes created by other players based on the titles and descriptions they provided.

1. The user can browse the entire paginated list of themes or filter using a typed keyword. Only themes whose title or description contain the typed keyword (using case-insensitive matching) are displayed.
1. The user selects a Theme.
1. The Theme and its set of Challenges are saved to the user's device for later use.

## Creating a Custom Theme

The game device gives players the option to create custom themes
through the following process:
1. The user enters in a Title and Description for their theme.
1. The system queries an LLM for 500 new challenges of the desired theme, each containing a main phrase and 4 related phrases. It provides the Title and Description from the user as well as a description of the gameplay as context.
1. The system creates a new Theme in its database, as well as the new Challenges.
1. The new Theme and set of Challenges are saved to the user's device for later use.