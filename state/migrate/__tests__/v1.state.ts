const state = {
  audioResources: {
    '841500ef-cd48-4a42-8bd4-90ee841d19b4--modernized': {
      artwork: `https://flp-assets.nyc3.digitaloceanspaces.com/en/ann-branson/journal/modernized/Journal_of_Ann_Branson--modernized--audio.png`,
      date: `Tue Oct 27 2020 19:24:19 GMT+0000 (Coordinated Universal Time)`,
      description: `Ann Branson (1808-1891) was one of the very last, true ministers (having been prepared, called, and used of the Lord) in a greatly reduced and sadly degenerate Society. Her deepest cry to the Lord, from the days of her childhood, was that “His eye would not pity, nor His hand spare” till He had thoroughly cleansed her heart, and made her a useful vessel in His house. Humbling herself before God and men, she was exalted by the Lord as a powerful and prophetic minister, one of the few in her day who stood in the purity and power of the original Quakers, even while all around her the 200 year old lampstand of the Society of Friends slowly and tragically burned out.`,
      friend: `Ann Branson`,
      friendSort: `Branson, Ann`,
      id: `841500ef-cd48-4a42-8bd4-90ee841d19b4--modernized`,
      parts: [
        {
          audioId: `841500ef-cd48-4a42-8bd4-90ee841d19b4--modernized`,
          duration: 3114.05,
          index: 0,
          size: 29026592,
          sizeLq: 15642435,
          title: `Chapter 1`,
          url: `https://flp-assets.nyc3.digitaloceanspaces.com/en/ann-branson/journal/modernized/Journal_of_Ann_Branson--pt1.mp3`,
          urlLq: `https://flp-assets.nyc3.digitaloceanspaces.com/en/ann-branson/journal/modernized/Journal_of_Ann_Branson--pt1--lq.mp3`,
        },
        {
          audioId: `841500ef-cd48-4a42-8bd4-90ee841d19b4--modernized`,
          duration: 2578.89,
          index: 1,
          size: 24704746,
          sizeLq: 12966816,
          title: `Chapter 2`,
          url: `https://flp-assets.nyc3.digitaloceanspaces.com/en/ann-branson/journal/modernized/Journal_of_Ann_Branson--pt2.mp3`,
          urlLq: `https://flp-assets.nyc3.digitaloceanspaces.com/en/ann-branson/journal/modernized/Journal_of_Ann_Branson--pt2--lq.mp3`,
        },
        {
          audioId: `841500ef-cd48-4a42-8bd4-90ee841d19b4--modernized`,
          duration: 2777.7,
          index: 2,
          size: 26149205,
          sizeLq: 13960775,
          title: `Chapter 3`,
          url: `https://flp-assets.nyc3.digitaloceanspaces.com/en/ann-branson/journal/modernized/Journal_of_Ann_Branson--pt3.mp3`,
          urlLq: `https://flp-assets.nyc3.digitaloceanspaces.com/en/ann-branson/journal/modernized/Journal_of_Ann_Branson--pt3--lq.mp3`,
        },
      ],
      reader: `Jessie Henderson`,
      shortDescription: `The journal and letters of Ann Branson, a minister in the Society of Friends who faithfully adhered to the principles and practices of Truth in a time of great division and decadence.`,
      title: `The Journal of Ann Branson`,
    },
  },
  trackPosition: {
    '280c72ea-df5b-4504-a140-51aec77455e0--updated--0': 10.399409946,
  },
  preferences: {
    audioQuality: `HQ`,
    audioSortHeaderHeight: 113.5,
    searchQuery: ``,
    sortAudiosBy: `published`,
  },
  filesystem: {
    'artwork/280c72ea-df5b-4504-a140-51aec77455e0--updated.png': {
      bytesOnDisk: 69148,
      totalBytes: 69148,
    },
    'data/state.json': {
      bytesOnDisk: 157246,
      totalBytes: 157246,
    },
    'audio/resources.json': {
      bytesOnDisk: 154668,
      totalBytes: 154668,
    },
    'audio/fea5c7ff-bd6f-4c46-b928-c3b4fb1a04e6--updated--0--HQ.mp3': {
      bytesOnDisk: 0,
      totalBytes: 5230731,
    },
  },
  playback: {
    audioId: `280c72ea-df5b-4504-a140-51aec77455e0--updated`, // can be `null`
    state: `STOPPED`,
  },
  activePart: {
    '280c72ea-df5b-4504-a140-51aec77455e0--updated': 0,
  },
  network: {
    connected: true,
    recentFailedAttempt: false,
    showModal: false,
  },
};

export function getV1State(): typeof state {
  return JSON.parse(JSON.stringify(state));
}
