# product requirement
- What I want to build is a trend finder that businesses like toy importers or fashion brands can use to find trending products in their particular niches globally to better inform themselves on their decisions.
- this will be vertical agnostic. every vertical will have its own category 
- this will be region agnostic. depending on user's region, the source for the data will be configured

# product flow
the user enters his input in natural language and the app takes his input and uses an llm to extract features like price range, keywords, etc
the user can then edit those features
once final then the app scrapes the available sources like ecommerce stores, social media, etc
these sources will be preconfigured
the scraping returns a list of products
my app then groups these products using similarities in product title, description, etc
the user can see where that group is trending and metrics regarding that
then user can see for individual products where it is trending and metrics regarding it
then user can select a product/group and find wholesale sellers for it
these sellers will be preconfigured

# tech
- I know go, node, n8n, langgraph, next, azure, supabase, postgres, mongo
- I am completely new to AI and only know a bit of langgraph
- use least complex combination of tech

# questions:
- what is the most low cost way to build an mvp for this?
- the parts that can be outsourced to an api/existing tool, do it
- what more will i have to learn