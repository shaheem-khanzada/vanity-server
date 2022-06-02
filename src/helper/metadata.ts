const modifyMetaData = ({
    tokenId, needle, rank
}) => {
    const metadata = {
        name: `Origins #${tokenId}`,
        description: "Vanity Origins is the collection of 500 unique realistic 3D rendered diamonds, all in 4k. Each diamond is made by hand without using any generator. There's a 1 in 500 chances of getting a special Purple Quartz Crystal, which will be rewarded with an IRL prize.",
        image: "https://gateway.pinata.cloud/ipfs/Qmdi1sqp1Gh2NDUXSabVscMVsRVxoodJCftkdEULKewVgD/495.mp4",
        attributes: [
            {
                trait_type: "Needle",
                value: needle
            },
            {
                trait_type: "Rank",
                value: rank
            },
            {
                trait_type: "Colour",
                value: "Deep Koamaru"
            },
            {
                trait_type: "Reflection",
                value: "Scampi"
            },
            {
                trait_type: "Background",
                value: "Periwinkle Gray"
            }
        ]
    }
    return JSON.stringify(metadata);
};

export default modifyMetaData;