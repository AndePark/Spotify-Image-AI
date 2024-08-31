const express = require('express');
const router = express.Router();
const openai = require('../openAI');


router.post('/generateImage', async (req, res) => {
    try {
        const {danceability, energy, tempo} = req.body;

        const prompt = `Create an image that visually embodies and expresses a range of emotions, \
                        capturing the essence of values ${danceability}, ${energy}, ${tempo}. The image should evoke a \
                        specific emotion or mood, seamlessly aligning with the theme and atmosphere of the corresponding \
                        playlist. Use vivid colors, imaginative designs, and evocative patterns to create an immersive \
                        visual experience that resonates with the listener and enhances their connection with the music.`;

        const image = await openai.images.generate({
            prompt,
            n: 1,
            size: "256x256",
            response_format: "b64_json", // Set the response format to base64 JSON
        });
        
        const imageBase64 = image.data[0].b64_json; // Extract the base64 image data
        res.json({ imageBase64 });
    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).send('Error generating image');
    }
});

module.exports = router;

