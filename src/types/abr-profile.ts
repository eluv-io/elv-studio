interface RungSpec {
  bit_rate: number;
  media_type: "audio" | "video";
  pregenerate: boolean;
  width?: string;
  height?: string;
}

export interface AbrProfile {
  drm_optional?: boolean;
  store_clear?: boolean;
  ladder_specs?: {
    [key: string]: {
      run_specs: RungSpec[]
    }
  };
  playout_formats?: {
    [key: string]: {
      drm: boolean | null | {
        enc_scheme_name: string;
        type: string;
      };
      protocol: {
        min_buffer_length?: number;
        type: "ProtoDash" | "ProtoHls";
      }
    }
  };
  segment_specs?: {
    audio: {
      segs_per_chunk: number;
      target_dur: number;
    };
    video: {
      segs_per_chunk: number;
      target_dur: number;
    }
  }
}
