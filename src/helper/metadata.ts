import { IPFS_IMAGE_BASE_URL_1, IPFS_IMAGE_BASE_URL_2, IPFS_VIDEO_BASE_URL_1, IPFS_VIDEO_BASE_URL_2 } from 'src/constants';

const modifyMetaData = ({ tokenId, needle, rank, assetUrl, image }) => {
  const metadata = {
    name: `Origins #${tokenId}`,
    description:
      "Vanity Origins is the collection of 500 unique realistic 3D rendered diamonds, all in 4k. Each diamond is made by hand without using any generator. There's a 1 in 500 chances of getting a special Purple Quartz Crystal, which will be rewarded with an IRL prize.",
    image: image,
    animation_type: assetUrl,
    attributes: [
      {
        trait_type: 'Needle',
        value: needle,
      },
      {
        trait_type: 'Rank',
        value: rank,
      },
      {
        trait_type: 'Colour',
        value: 'Deep Koamaru',
      },
      {
        trait_type: 'Reflection',
        value: 'Scampi',
      },
      {
        trait_type: 'Background',
        value: 'Periwinkle Gray',
      },
    ],
  };
  return JSON.stringify(metadata);
};

export default modifyMetaData;

export const convertTokeIdToVideoId = ({ tokenId }) => {
  switch (tokenId.length) {
    case 1:
      return `00${tokenId}`;
    case 2:
      return `0${tokenId}`;
    case 3:
      return `${tokenId}`;
    default:
      break;
  }
};

export const getIpfsBaseUrl = ({ tokenId, type }) => {
  if (type === 'video') {
    if (parseInt(tokenId) > 282) {
      return IPFS_VIDEO_BASE_URL_2;
    }
    return IPFS_VIDEO_BASE_URL_1;
  } else if (type === 'image') {
    if (parseInt(tokenId) > 282) {
      return IPFS_IMAGE_BASE_URL_2;
    }
    return IPFS_IMAGE_BASE_URL_1;
  }
};
