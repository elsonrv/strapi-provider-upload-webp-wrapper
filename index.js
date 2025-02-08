const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

module.exports = {
    init(providerOptions) {
        if (!providerOptions) {
            throw new Error('Missing providerOptions config')
        }

        if (!providerOptions.redirect) {
            throw new Error('Missing redirect config')
        }

        const redirect = providerOptions.redirect
        let provider

        try {
            provider = require(`@strapi/provider-upload-${redirect.provider}`).init(redirect.providerOptions)
        } catch(e) {
            try {
                provider = require(`${redirect.provider}`).init(redirect.providerOptions)
            } catch(e) {
                throw new Error(`Fail to load the redirect provider [${redirect.provider}]`)
            }
        }

        const mimeTypes = providerOptions.mimeTypes ? providerOptions.mimeTypes : ['image/png', 'image/jpeg', 'image/jpg']
        const sharpOptions = providerOptions.sharpOptions ? providerOptions.sharpOptions : {}

        return {
            async upload(file, actionOptions) {
                if (!file.buffer) { return Promise.reject(new Error('File has no buffer')) }

                if (mimeTypes.includes(file.mime)) {
                    const filepath = file.filepath ? file.filepath : file.tmpPath
                    const webpFileName = `${path.parse(file.name).name}.webp`;
                    const webpFilePath = path.join(path.dirname(filepath), webpFileName);
                    await sharp(filepath).webp(sharpOptions).toFile(webpFilePath);
                    const stats = fs.statSync(webpFilePath)
                    file.filepath = webpFilePath
                    file.ext = '.webp'
                    file.buffer = await fs.promises.readFile(webpFilePath)
                    file.sizeInBytes = stats.size
                    file.size = Math.floor((stats.size / 1000) * 100) / 100
                    file.name = webpFileName
                    file.isConverted = true
                }
          
                return new Promise((resolve, reject) => {
                    return provider.upload(file, actionOptions)
                        .then(data => { 
                            if (file.isConverted) { fs.unlinkSync(file.filepath) }
                            resolve(data) 
                        })
                        .catch(error => { reject(error) })
                })
            },
            async uploadStream(file, actionOptions) {
                if (!file.stream) { return Promise.reject(new Error('File is not a stream')) }
                
                if (mimeTypes.includes(file.mime)) {
                    const filepath = file.filepath ? file.filepath : file.tmpPath
                    const webpFileName = `${path.parse(file.name).name}.webp`;
                    const webpFilePath = path.join(path.dirname(filepath), webpFileName);
                    await sharp(filepath).webp(sharpOptions).toFile(webpFilePath);
                    const stats = fs.statSync(webpFilePath)
                    file.filepath = webpFilePath
                    file.ext = '.webp'
                    file.stream = fs.createReadStream(webpFilePath)
                    file.sizeInBytes = stats.size
                    file.size = Math.floor((stats.size / 1000) * 100) / 100
                    file.name = webpFileName
                    file.isConverted = true
                }

                return new Promise((resolve, reject) => {
                    return provider.uploadStream(file, actionOptions)
                        .then(data => { 
                            if (file.isConverted) { fs.unlinkSync(file.filepath) }
                            resolve(data) 
                        })
                        .catch(error => { reject(error) })
                })
            },
            delete(file, actionOptions) {
                return provider.delete(file, actionOptions)
            },
            checkFileSize(file, actionOptions) {
                provider.checkFileSize(file, actionOptions)
            },
            isPrivate(file, actionOptions) {
                return provider.isPrivate ? provider.isPrivate(file, actionOptions) : false
            },
            getSignedUrl(file, actionOptions) {
                return provider.getSignedUrl ? provider.getSignedUrl(file, actionOptions) : file
            }
        }
    }
}