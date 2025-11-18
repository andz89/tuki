import React from "react";
import { useFeaturedImages } from "./useFeaturedImages";
import { AlertBoxElement } from "../../components/UI/Notification";
import FeaturedImagesTemplate from "../../components/templates/FeaturedImages_template";

export default function FeaturedImages() {
  const { images, error } = useFeaturedImages();

  if (error) {
    return (
      <AlertBoxElement
        message={<>Oops! Something went wrong. Please refresh the page.</>}
        type="error"
      />
    );
  }

  if (images.length === 0) {
    return (
      <AlertBoxElement
        message={<>No featured images found on this page.</>}
        type="info"
      />
    );
  }

  return <FeaturedImagesTemplate images={images} />;
}
