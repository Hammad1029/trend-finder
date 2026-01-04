from langchain_openai import ChatOpenAI
from langchain_openai import OpenAIEmbeddings

# https://platform.openai.com/docs/pricing

chat_model = ChatOpenAI(model="gpt-5-nano", temperature=0.1)
embeddings_model = OpenAIEmbeddings(model="text-embedding-3-small")
