export default function FeaturedImagesTemplate({ images }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-2 border border-gray-200 dark:border-gray-700">
      <p className="text-base font-medium text-gray-800 dark:text-gray-200 mb-2">
        Featured Images
      </p>

      <div className="flex flex-col gap-4">
        {images.map(({ property, url }, index) => (
          <div key={index}>
            <span className="block mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
              {property}{" "}
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline text-xs break-words hover:text-pink-600"
              >
                {url}
              </a>
            </span>

            <img
              src={url}
              alt={property}
              className="mt-2 max-w-full rounded bg-slate-200 p-2"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
