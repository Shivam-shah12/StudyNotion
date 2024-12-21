import { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FiUploadCloud } from "react-icons/fi";
import { useSelector } from "react-redux";
import { Player } from "video-react";
import "video-react/dist/video-react.css";




export default function Upload({
  name,
  label,
  register,
  setValue,
  errors,
  video = false,
  viewData = null,
  editData = null,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewSource, setPreviewSource] = useState(
    viewData || editData || ""
  );
  const [errorMessage, setErrorMessage] = useState(null);
  // const inputRef = useRef(null);

  const MAX_FILE_SIZE_MB = 10; // Max file size in MB

  // Handle file preview generation
  const previewFile = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setPreviewSource(reader.result);
    };
    reader.onerror = () => {
      setErrorMessage("Error reading file. Please try again.");
    };
  };

  // Handle file drop
  const onDrop = (acceptedFiles, rejectedFiles) => {
    setErrorMessage(null); // Reset errors on drop

    if (rejectedFiles.length > 0) {
      setErrorMessage(
        "Invalid file type or size. Please upload a valid file."
      );
      return;
    }

    const file = acceptedFiles[0];
    if (file) {
      if (file.size / 1024 / 1024 > MAX_FILE_SIZE_MB) {
        setErrorMessage(`File size exceeds the limit of ${MAX_FILE_SIZE_MB} MB.`);
        return;
      }
      previewFile(file);
      setSelectedFile(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: video
      ? { "video/*": [".mp4"] }
      : { "image/*": [".jpeg", ".jpg", ".png"] },
    onDrop,
    multiple: false, // Prevent multiple file selection
  });

  // Register input with react-hook-form
  useEffect(() => {
    register(name, { required: true });
  }, [register, name]);

  // Update form value with selected file
  useEffect(() => {
    setValue(name, selectedFile);
  }, [selectedFile, setValue, name]);

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm text-richblack-5" htmlFor={name}>
        {label} {!viewData && <sup className="text-pink-200">*</sup>}
      </label>
      <div
        {...getRootProps()}
        className={`${
          isDragActive ? "bg-richblack-600" : "bg-richblack-700"
        } flex min-h-[250px] cursor-pointer items-center justify-center rounded-md border-2 border-dotted border-richblack-500`}
      >
        <input {...getInputProps()}  />
        {previewSource ? (
          <div className="flex w-full flex-col p-6">
            {!video ? (
              <img
                src={previewSource}
                alt="Preview"
                className="h-full w-full rounded-md object-cover"
              />
            ) : (
              <Player aspectRatio="16:9" playsInline src={previewSource} />
            )}
            {!viewData && (
              <button
                type="button"
                onClick={() => {
                  setPreviewSource("");
                  setSelectedFile(null);
                  setValue(name, null);
                  setErrorMessage(null); // Clear errors on cancel
                }}
                className="mt-3 text-richblack-400 underline"
              >
                Cancel
              </button>
            )}
          </div>
        ) : (
          <div className="flex w-full flex-col items-center p-6">
            <div className="grid aspect-square w-14 place-items-center rounded-full bg-pure-greys-800">
              <FiUploadCloud className="text-2xl text-yellow-50" />
            </div>
            <p className="mt-2 max-w-[200px] text-center text-sm text-richblack-200">
              Drag and drop an {!video ? "image" : "video"}, or click to{" "}
              <span className="font-semibold text-yellow-50">Browse</span> a
              file
            </p>
            <ul className="mt-10 flex list-disc justify-between space-x-12 text-center text-xs text-richblack-200">
              <li>Aspect ratio 16:9</li>
              <li>Recommended size 1024x576</li>
              <li>Max size {MAX_FILE_SIZE_MB} MB</li>
            </ul>
          </div>
        )}
      </div>
      {/* Error messages */}
      {errorMessage && (
        <span className="ml-2 text-xs tracking-wide text-pink-200">
          {errorMessage}
        </span>
      )}
      {errors[name] && !errorMessage && (
        <span className="ml-2 text-xs tracking-wide text-pink-200">
          {label} is required
        </span>
      )}
    </div>
  );
}
