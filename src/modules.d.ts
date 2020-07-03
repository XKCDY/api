declare module 'probe-image-size' {
  interface ProbeResult {
    width: number;
    height: number;
    type: string;
    mime: string;
    wUnits: string;
    hUnits: string;
    url: string;
  }

  interface ProbeError {
    code: string;
    status: number;
  }

  export default function(url: string): Promise<ProbeResult>;
}
