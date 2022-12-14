import React from "react";
import {useDropzone} from "react-dropzone";

import ImageIcon from "Components/common/ImageIcon";
import PictureIcon from "Assets/icons/image.svg";

const Dropzone = ({accept, id, onDrop, disabled}) => {
  const {
    getRootProps,
    getInputProps,
    isDragActive
  } = useDropzone({
    accept,
    onDrop,
    disabled
  });

  return (
    <section className={`dropzone${disabled ? " dropzone--disabled" : ""}`} id={id}>
      <div {...getRootProps({
        className: `dropzone__area${isDragActive ? " dropzone__area--active" : ""}`
      })}>
        <ImageIcon
          label="Drag and drop area"
          className="dropzone__icon"
          icon={PictureIcon}
        />
        <div className="dropzone__instructions">Drag and drop a file or click to upload</div>
        <input {...getInputProps()} />
      </div>
    </section>
  );
};

export default Dropzone;
