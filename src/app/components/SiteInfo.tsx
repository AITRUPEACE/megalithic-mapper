import { Site } from "../types/types";

interface SiteInfoProps {
	site: Site;
	onClose: () => void;
	onUpdateLocation: () => void;
}

export default function SiteInfo({ site, onClose, onUpdateLocation }: SiteInfoProps) {
	return (
		<div className="mapboxgl-ctrl" style={{ position: "absolute", top: 10, left: 10 }}>
			<div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-lg max-w-sm">
				<h3 className="text-lg font-bold text-black dark:text-white">{site.name}</h3>
				<p className="text-sm mt-1 text-black dark:text-gray-200">{site.description}</p>
				<div className="mt-2">
					<span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-black dark:text-white">{site.type.name}</span>
					{site.civilization && (
						<span className="ml-2 text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-black dark:text-white">
							{site.civilization}
						</span>
					)}
				</div>
				<div className="mt-2 flex flex-wrap gap-1">
					{site.tags.map((tag) => (
						<span key={tag} className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100">
							{tag}
						</span>
					))}
				</div>
				<button
					className="mt-2 px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
					onClick={onClose}
				>
					Close
				</button>
				<button
					className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
					onClick={onUpdateLocation}
				>
					Update Location
				</button>
			</div>
		</div>
	);
}
