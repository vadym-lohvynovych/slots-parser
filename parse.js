let request = require('request');
let cheerio = require('cheerio');
let fs = require('fs');

//Ainsworth
//Bally Wulff
//Blueprint
//EGT
//Endorphina
//Foxium
//GameArt
//High5
//Inspired Gaming
//Lighting Box
//MrSlotty
//Nolimit City TOP
//Play'n Go
//SoftSwiss
//Spinomenal
//Stake Logic
//Wazdan https://www.slotsup.com/free-slots-online/wazdan
//Yggdrasil TOP https://www.slotsup.com/free-slots-online/yggdrasil


let URL = 'https://www.slotsup.com/free-slots-online/yggdrasil';
let resArr = [];


fs.readFile('slots.json', function(err, data){
    if(err){
        console.error(err);
    }else{
        resArr = JSON.parse(data);
    }
});


request(URL, function (err, res, body) {
    if (err) throw err;

    new Promise((resolve, reject) => {
            request(URL, function (err, res, body) {
                if (err) reject(err);
                let $ = cheerio.load(body);
                let result = $('.game-box').find('a');
                let links = [];
                for(let i = 0; i < result.length; i++) {
                    links.push(result[i].attribs.href)
                }
                resolve({
                    links
                })
            });
        })
        .then(async result => {
            for(let i = 0; i < result.links.length; i++) {
                let info = await getInfo(result.links[i]);
                let ready = `(${i + 1}/${result.links.length})`;
                console.log('--->', 'Ready: ', (((i + 1)/result.links.length)*100).toFixed(2) + '%', ready);
                resArr.push(info);
            }
            return JSON.stringify(resArr);

        })
        .then(result => {
            fs.writeFile('slots.json', result, function(err) {
                if(err) throw new Error(err);
            });
            setTimeout(function() {
                console.log('--->', 'DONE :)');
            }, 1000);
        })
        .catch(err => console.log('--->', err));

});

async function getInfo(URL) {
    let promise = new Promise((resolve, reject) => {
        request(URL, function (err, res, body) {
            if (err) reject(err);
            let $ = cheerio.load(body);
            let
                name = $('#playFree').text(),
                iframe = $('#gameCode').val(),
                imgLink = $('#gameThumbnail').find('img')[0].attribs['data-cfsrc'],
                review = $('article').find('.review'),
                descriptionFirst = $('.gbox.cf.toggle')[1],
                descriptionSecond = $('.gbox.cf.toggle')[2],
                options = $('#single_specification_widget-2').find('tr'),
                features = [],
                imgName;


            let reviewHead = $(review).find('h2').text();
            let reviewText = $(review).find('p').text();

            let descriptionFirstHead = $(descriptionFirst).find('h2').text();
            let descriptionFirstText = $(descriptionFirst).find('p, ul').text();

            let descriptionSecondHead = $(descriptionSecond).find('h2').text();
            let descriptionSecondText = $(descriptionSecond).find('p').text();

            for(let i = 0; i < options.length; i++) {
                let name = $(options[i]).find('th').text();
                let value = $(options[i]).find('td').text();
                features.push({
                    name, value
                });
            }

            let linkArr = imgLink.split('/');

            imgName = linkArr[linkArr.length - 1];

            // downloadFile(imgLink, imgName);

            resolve({
                name,
                iframe,
                img: imgName,
                review: {
                    head: reviewHead,
                    text: reviewText
                },
                descriptionFirst: {
                    head: descriptionFirstHead,
                    text: descriptionFirstText,
                },
                descriptionSecond: {
                    head: descriptionSecondHead,
                    text: descriptionSecondText
                },
                features
            })
        });
    });

    return await promise;
}

function downloadFile(url, name) {

    let download = function(uri, filename, callback){
        request.head(uri, function(err, res, body){
            request(uri).pipe(fs.createWriteStream('./img/' + filename)).on('close', callback);
        });
    };

    download(url, name, function(){
        console.log(name);
    });
}

