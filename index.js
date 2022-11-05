const express = require('express');
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const app = express();
const PORT = process.env.PORT;

const createIei = async (url,color) => {
    const canvas = createCanvas(709, 800);
    const ctx = canvas.getContext('2d');
    const avatar = await loadImage(url);
    const iei = await loadImage('./assets/ieibase.png');
    ctx.drawImage(avatar, 82.5,146,544,544);
    const imgData = ctx.getImageData(0,0,709,800);
    const pixels = imgData.data;
    if (!color || color === 'false') {
        for (let i = 0; i < pixels.length; i += 4) {
  
            let lightness = parseInt((pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3);
        
            pixels[i] = lightness;
            pixels[i + 1] = lightness;
            pixels[i + 2] = lightness;
          }
          ctx.putImageData(imgData, 0, 0);
    }
    ctx.drawImage(iei,0,0);
    return canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, "");
}

app.get('/',async (req, res) => {
    console.log(req.query)
    if (req.query.url) {
        const url = req.query.url;
        const color = req.query.color
        if (!url) return res.json({
            status:false,
            message:'Cannot get parameter url',
            example:'~/?url=https://cdn.discordapp.com/avatars/783305816702844990/91fc389a1a14cb27d17b34f876697b4b.png?size=4096'
        });
        const ieidata = await createIei(url,color);
        const filename = `${Date.now()}.png`;
        await fs.writeFileSync(`./ieis/${filename}`, ieidata, 'base64');
        res.json({
            status:true,
            result:`~/?file=${filename}`
        });
    } else if (req.query.file) {
        const file = req.query.file;
        if (!file) return res.json({
            status:false,
            message:'Cannot get file'
        });
        try {
        fs.readFile(`${__dirname}/ieis/${file}`, function (err, data) {
            res.writeHead(200,{
                "content-type":"image/png"
            });
            res.end(data);
        })
    } catch (err) {
        console.error(err);
        res.json({
            status:false,
            message:'Cannot get file'
        })
    }
    } else {
        res.json({
            status:false,
            message:'Invalid form body',
            example:'~/?url=https://cdn.discordapp.com/avatars/783305816702844990/91fc389a1a14cb27d17b34f876697b4b.png?size=4096',
            params:{
                url:{
                    type:'string',
                    description:'URL of the photo to be included in the remains'
                },
                color:{
                    type:'boolean',
                    description:'Color availability'
                },
                file:{
                    type:'string',
                    description:'Retrieve already created remains'
                }
            }
        })
    }
});

app.listen(PORT , () => {
    console.log(`Server running on port ${PORT}`);
});

