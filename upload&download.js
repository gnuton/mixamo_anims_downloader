// Mixamo Animation uploader and downloadeer
// The following script makes use of mixamo API to upload all selected characters and 
// then download all animations that you selected.
// The animations are saved with index followed by motion description.

// This script was originally written by gnuton@gnuton.org and then modified by yibowen@usc.edu, and the authors are not responsible of its usage

//  How to use this script
//  1. Browse mixamo.com
//  2. Log in
//  3. Right click Inspect (F12 on chrome) and goto `Elements` tab
//  4. Right click `Edit as HTML`
//  5. Insert `<input type="file" id="uploader" multiple>` after `<body>`
//  6. You should see something like this on the top of the page: <input type="file" id="uploader" multiple>
//  7. Click select and select all the characters (`.obj`, `.fbx`) you want to use
//  8. Click `Console` tab and paste the full script in the mixamo.com console
//  9. The script will open a new blank page and you  will start to see animations downloading
//  10. Keep the blank page opened and keep on pressing "Allow multiple downlaods"

// Use Microsoft edge to avoid manual clicking
// Chrome will ask you all the time to allow multiple downloads
// You can disable this as follow:
// chrome://settings/ > Advanced > Content > Automatic downloads > uncheck "Do not allow any site to download multiple file automatically"

// add the exact descriptions of the animations you want (not using exact words will still work)
const animation_list = ["Ducking For Cover From Standing Idle","Evading Projectiles With A Jump Spin","Taunting Pointing At Wrist"]

//=================================================================================================

const bearer = localStorage.access_token

// finding an animation by name
const getAnimationByName = (name) => {
    console.log('Searching:', name);
    const init = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${bearer}`,
            'X-Api-Key': 'mixamo2'
        }
    };

    const listUrl = `https://www.mixamo.com/api/v1/products?type=Motion%2CMotionPack&query=${name}`;
    return fetch(listUrl, init).then((res) => res.json()).then((json) => json).catch(() => Promise.reject('Failed to download animation list'))
}

// search by animation id and character id
// retrieves json.details.gms_hash 
const getProduct = (animId, character) => {
    console.log('Getting default settings for motion:', animId);
    const init = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${bearer}`,
            'X-Api-Key': 'mixamo2'
        }
    };

    const productUrl = `https://www.mixamo.com/api/v1/products/${animId}?similar=0&character_id=${character}`;
    return fetch(productUrl, init).then((res) => res.json()).then((json) => json).catch(() => Promise.reject('Failed to download product details'))
}

// download one single animation
const downloadAnimation = (animId, character, filename) => {
    return getProduct(animId, character)
            .then((json) => json.details.gms_hash) // get default gms_hash
            .then((gms_hash) => {
                const pvals = gms_hash.params.map((param) => param[1]).join(',')
                const _gms_hash = Object.assign({}, gms_hash, { params: pvals }) // Anim is baked with default param values
                return exportAnimation(character, [_gms_hash], filename)
            })
            .then(a =>
                {return monitorAnimation(character)}
            )
            .catch(() => Promise.reject("Unable to download animation " + animId))
}

// pad leading 0s
const pad = (num) => {
    const padlen = 4;
    var pad = new Array(1 + padlen).join('0');
    return (pad + num).slice(-pad.length);
}

const downloadAnimLoop = (uuid,list,idx) => {
    if (!list.length) {
        console.log('>>> Finished downloading',pad(idx));
        return Promise.resolve('All animations have been downlaoded'); // no anims left
    }
    console.log(list.length+' remaining to be downloaded...');
    current_name = list[0]
    list = list.slice(1);
    return getAnimationByName(current_name)
            .then((result) => {
                if (!result.pagination.num_results) {
                    throw new Error("No animation with such name " + current_name)
                }
                return result
            })
            .then((json) => (
                {
                    id: json.results[0].id,
                    character: uuid
                }))
            .then((curr) => {
                return downloadAnimation(curr.id, curr.character, `${pad(idx)}_${current_name}`)
            })
            .then(a => {
                return downloadAnimLoop(uuid,list,idx)}
                ) //loop
            .catch((e) => {
                console.log("Recovering from animation failed to downlaod due to",e);
                return downloadAnimLoop(uuid,list,idx) // keep on looping 
            })
}

const uploadLoop = (idx) => {
    if (idx === files.length) {
        console.log('>>> COMPLETED');
        return Promise.resolve('All animations have been downlaoded'); // no character left
    }
    return startUpload(idx)
        .then((a) => {
            return uploadLoop(idx+1);
        })
        .catch((e) => {
            console.log("Recovering from uploading failed due to",e);
            return uploadLoop(idx+1); // keep on looping 
        })
}

// upload character
const uploadCharacter = (characterFile,fileName) => {
    console.log('Uploading character: ' + fileName)
    const uploadUrl = 'https://www.mixamo.com/api/v1/characters'
    const formData = new FormData();
    formData.append("file", new File([characterFile],fileName));
    const uploadInit = {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/javascript, */*',
            // 'Content-Type': 'multipart/form-data', // adding this line breaks the request
            'Authorization': `Bearer ${bearer}`,
            'X-Api-Key': 'mixamo2',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: formData
    }
    return fetch(uploadUrl, uploadInit).then((res) => res.json()).then((json) => json)
}

// export animation
const exportAnimation = (character_id, gmsHashArray, product_name) => {
    console.log("Exporting to:" + product_name + ".fbx")
    const exportUrl = 'https://www.mixamo.com/api/v1/animations/export'
    const exportBody = {
        character_id,
        gms_hash: gmsHashArray, //[{ "model-id": 103120902, "mirror": false, "trim": [0, 100], "overdrive": 0, "params": "0,0,0", "arm-space": 0, "inplace": false }],
        preferences: { format: "fbx7_2019", skin: "true", fps: "30", reducekf: "0" },
        product_name,
        type: "Motion"
    };
    const exportInit = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${bearer}`,
            'X-Api-Key': 'mixamo2',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(exportBody)
    }
    return fetch(exportUrl, exportInit)
        .then((res) => {
            switch (res.status) {
                case 404: {
                    const errorMsg = ('ERROR: Export got 404 error: ' + res.error + ' message=' + res.message);
                    console.error(errorMsg);
                    throw new Error(errorMsg);
                } break
                case 429: {
                    console.error("Too many requests");
                    console.log("Retrying export...");
                    wait(1000); // a delay function, should be improved
                    return exportAnimation(character_id, gmsHashArray, product_name);
                } break
                case 202:
                case 200: {
                    return res.json()
                } break
                default:
                    throw new Error('Response not handled', res);
            }
        })
        .then((json) => json)
        .catch((e) => {
            console.error("Exporting error",e)
            return Promise.reject("Unable to export animation" + e)
        })
}

// wait
const wait = (ms) => {
    var start = Date.now(),
        now = start;
    while (now - start < ms) {
      now = Date.now();
    }
}

const monitorAnimation = (characterId) => {
    const monitorUrl = `https://www.mixamo.com/api/v1/characters/${characterId}/monitor`;
    const monitorInit = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${bearer}`,
            'X-Api-Key': 'mixamo2'
        }
    };
    return fetch(monitorUrl, monitorInit)
        .then((res) => {
            switch (res.status) {
                case 404: {
                    const errorMsg = ('ERROR: Monitor got 404 error: ' + res.error + ' message=' + res.message);
                    console.error(errorMsg);
                    throw new Error(errorMsg);
                } break
                case 202:
                case 200: {
                    return res.json()
                } break
                default:
                    throw new Error('Response not handled', res);
            }
        }).then((msg) => {
            switch (msg.status) {
                case 'completed':
                    console.log('Downloading:', msg.job_result);
                    downloadingTab.location.href = msg.job_result;
                    return msg.uuid;
                    break;
                case 'processing':
                    console.log('Processing...');
                    wait(2000); // a delay function, should be improved
                    return monitorAnimation(characterId);
                case 'failed':
                    console.error('Job failed due to',msg.job_result.message)
                    return
                default:
                    const errorMsg = ('ERROR: Monitor status:' + msg.status + ' message:' + msg.message + 'result:' + JSON.stringify(msg.job_result));
                    console.error(errorMsg);
                    throw new Error(errorMsg);
            }
        }).catch((e) => {
            console.error("Monitoring error",e)
            return Promise.reject("Unable to monitor job for character " + characterId + e)
        })
}

// Workaround for downloading files from a promise
// NOTE that chrome will detect you are downloading multiple files in a single TAB. Please allow it!
const downloadingTab = window.open('', '_blank');

// const file1 = document.getElementById('uploader').files[0]
// uploadCharacter(file1,"test.py")

// start uploading
const startUpload = (idx) => {
    console.log('>>> Start uploading',pad(idx));
    const file = files[idx]

    return uploadCharacter(file,`${pad(idx)}.fbx`)
    .then(json => {
        return monitorAnimation(json.uuid)
    })
    .then(uuid => {
        return startDownload(uuid,idx)
    })
    .catch(() => Promise.reject("Unable to upload character number" + pad(idx)))
}

// start downloading
const startDownload = (uuid,idx) => {
    console.log('>>> Start downloading', pad(idx));
    if (!uuid) {
        console.error("No valid character ID");
        return
    }
    if (!animation_list.length) {
        console.error("Please add valid animation IDs at the beginnig of the script");
        return
    }
    return downloadAnimLoop(uuid,animation_list,idx);
}

// all the files selected in browser
const files = document.getElementById('uploader').files
console.log(files.length+" files in total")

uploadLoop(0)