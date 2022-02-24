import HLS from 'hls-parser';

export function alignPDT(data) {
  const playlist = HLS.parse(data);

  if (playlist.isMasterPlaylist || playlist.segments.length === 0) {
    return data;
  }

  let pdt = playlist.segments[0].programDateTime;

  if (!pdt) {
    console.log('The first segment does not have PDT');
    return data;
  }

  for (const segment of playlist.segments) {
    segment.programDateTime = pdt;
    pdt = new Date(pdt.getTime() + segment.duration * 1000);
  }

  return HLS.stringify(playlist);
}
