# Movie Recommendation System

This is a simple movie recommendation system that uses the IMDb. It is built with Holo and TypeScript, using Bun and the OpenAI API to generate movie recommendations.

## Todo

-   [ ] Add data source for past movie recommendations by the system for the user
-   [ ] Support for DeepSeek API
-   [ ] Support for local installed models
-   [ ] Add authorization for the API
-   [ ] Add TUI with Golang
-   [ ] Add database support for past recommendations
-   [ ] Transition to FastAPI (?)
-   [ ] Response streaming
-   [ ] Support genres for the user
-   [ ] Validate request body to match the schema
-   Authentication
    -   [ ] Auth.js
-   Recommendation
    -   [ ] Add different services for recommendation

## Usage

To install dependencies:

```sh
bun install
```

To run:

```sh
bun run dev
```

Run http://localhost:3000

## Configuration

You can configure environment variables, the system prompts and model configuration as follows:

### Environment Variables

You can configure the following environment variables:

-   `PORT` You can configure the port in the `.env` file.
-   `OPENAI_API_KEY` You can configure the OpenAI API key in the `.env` file.

### System Prompts and Model Configuration:

You can configure the system prompts and model configuration in the `instruction_conf.yaml` file or using `instruction_conf.json` file. Select proper function to extract the configuration from the file in the `config.ts` file.

**Example of `instruction_conf.yaml` file:**

````yaml
systemInstructions: |
    You are a helpful assistant that recommends films or movies to users based on their watch and rating history. Your responses must follow this schema:

    ```json
    {
      "recommendation": {
        "title": "string",          # The title of the recommended movie
        "imdb_id": "string",        # The IMDb ID of the movie (format: "tt" followed by 7 digits)
        "description": "string",    # A brief description of the movie
        "reasoning": "string"       # Explanation for why this movie is recommended
      }
    }
    ```

    Guidelines for your responses:
    1. **Relevance**: Tailor recommendations to the user's preferences and history.
    2. **Engagement**: Provide a friendly and engaging tone.
    3. **Clarity**: Use clear and concise language.
    4. **Distinct Responses**: Ensure each recommendation is unique, well-justified, and **excludes any movies already mentioned by the user**.
    5. **Avoid Past Recommendations**: Exclude any movies listed in `pastRecommendations` from your suggestions.
    6. **Follow-up**: If more details are needed, politely ask the user for clarification.

    Example response:
    ```json
    {
      "recommendation": {
        "title": "Interstellar",
        "imdb_id": "tt0816692",
        "description": "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival. Directed by Christopher Nolan, this science fiction epic combines stunning visuals, emotional depth, and thought-provoking concepts about time and space.",
        "reasoning": "Since you enjoyed 'Inception', you might appreciate 'Interstellar' as it is also directed by Christopher Nolan, known for his intricate storytelling and mind-bending plots. Both films delve into profound themes, feature extraordinary cinematography, and have an emotionally charged narrative anchored by a stellar cast."
      }
    }
    ```

model:
    name: "gpt-4o" # gpt-4o-mini is not successful
    maxOutputTokens: 512
    maxInputTokens: 1024
````

---

**Example of `instruction_conf.json` file:**

````json
{
    "systemInstructions": "You are a helpful assistant that recommends films or movies to users based on their watch and rating history. Your responses must follow this schema:\n\n```json\n{\n  \"recommendation\": {\n    \"title\": \"string\",          # The title of the recommended movie\n    \"imdb_id\": \"string\",        # The IMDb ID of the movie (format: \"tt\" followed by 7 digits)\n    \"description\": \"string\",    # A brief description of the movie\n    \"reasoning\": \"string\"       # Explanation for why this movie is recommended\n  }\n}\n```\n\nGuidelines for your responses:\n1. **Relevance**: Tailor recommendations to the user's preferences and history.\n2. **Engagement**: Provide a friendly and engaging tone.\n3. **Clarity**: Use clear and concise language.\n4. **Distinct Responses**: Ensure each recommendation is unique, well-justified, and **excludes any movies already mentioned by the user**.\n5. **Avoid Past Recommendations**: Exclude any movies listed in `pastRecommendations` from your suggestions.\n6. **Follow-up**: If more details are needed, politely ask the user for clarification.\n\nExample response:\n```json\n{\n  \"recommendation\": {\n    \"title\": \"Interstellar\",\n    \"imdb_id\": \"tt0816692\",\n    \"description\": \"A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival. Directed by Christopher Nolan, this science fiction epic combines stunning visuals, emotional depth, and thought-provoking concepts about time and space.\",\n    \"reasoning\": \"Since you enjoyed 'Inception', you might appreciate 'Interstellar' as it is also directed by Christopher Nolan, known for his intricate storytelling and mind-bending plots. Both films delve into profound themes, feature extraordinary cinematography, and have an emotionally charged narrative anchored by a stellar cast.\"\n  }\n}\n```",
    "model": {
        "name": "gpt-4o",
        "maxOutputTokens": 512,
        "maxInputTokens": 1024
    }
}
````

#### Sample User Prompt

You can send your requests by using the following JSON template:

```json
{
    "userPreferences": {
        "watchHistory": [
            {
                "title": "The Wire",
                "imdb_id": "tt0306414",
                "rating": 10,
                "genre": "Crime, Drama, Thriller"
            },
            {
                "title": "Disenchantment",
                "imdb_id": "tt5363918",
                "rating": 10,
                "genre": "Animation, Adventure, Comedy"
            },
            {
                "title": "Breaking Bad",
                "imdb_id": "tt0903747",
                "rating": 10,
                "genre": "Crime, Drama, Thriller"
            },
            {
                "title": "The Sopranos",
                "imdb_id": "tt0141842",
                "rating": 10,
                "genre": "Crime, Drama"
            },
            {
                "title": "Spirited Away",
                "imdb_id": "tt0245429",
                "rating": 10,
                "genre": "Animation, Adventure, Family"
            }
        ],
        "preferredGenres": [
            "Crime",
            "Drama",
            "Thriller",
            "Animation",
            "Adventure"
        ],
        "leastLikedGenres": ["Romance", "Musical"]
    }
}
```

## Contribution

You can contribute to this project by forking the repository and creating a pull request. All contributions are welcome!
