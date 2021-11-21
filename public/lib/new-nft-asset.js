const tokenName = document.getElementById('tokenName');
const descriptionTable = document.getElementById('description');
const attributesTable = document.getElementById('attributes');
const artistTable = document.getElementById('artist');
const marketLink = document.getElementById('market');

tokenName.innerHTML = tokenMeta.name;
descriptionTable.innerHTML = description.replaceAll(`\n`, `<br>`);;
attributesTable.innerHTML = '';
tokenAttributes.forEach(x => {
    attributesTable.innerHTML += `${x.trait_type}: ${x.value} <br>`
});
artistTable.innerHTML = `<a href="mailto:${tokenMeta.artistEmail}">${tokenMeta.artistName}</a>`;
marketLink.innerHTML = `<a href="${tokenMeta.opensea_url}" target="_blank">
                OpenSea 
                <img style="width:30px;" class="ml-2"
                src="https://storage.googleapis.com/opensea-static/Logomark/Logomark-Blue.png" 
                alt="Available on OpenSea" /></a>`;