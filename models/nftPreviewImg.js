const db = require('../utils/db');

class NftPreviewImg {
    projectName;
    contractHash;
    tokenId;
    imgData;
    created;

    async save(next) {
        const text = 'INSERT INTO Nft_Preview_Img(project_Name, contract_Hash, token_Id, img_Data) VALUES($1, $2, $3, $4) RETURNING *';
        const values = [
            this.projectName, 
            this.contractHash,
            this.tokenId,
            this.imgData,
        ];
        db.query(text, values, next);
    }

    static findOne(contractHash, tokenId, next) {
        const text = 'SELECT * FROM Nft_Preview_Img WHERE contract_Hash = $1 AND token_Id = $2';
        const values = [contractHash, tokenId];
        db.query(text, values, next);
    }
}

module.exports.NftPreviewImg = NftPreviewImg;