export const aggregateByKey = (keys, values) => {
	const aggValues = {};
	keys.forEach((k, i) => {
		const v = values[i];
		if (!aggValues[k]) {
			aggValues[k] = Object.assign({'n': 1}, v);
		} else {
			if (v) {
				const valueKeys = Object.keys(v);
				valueKeys.forEach(vk => {
					aggValues[k][vk] += v[vk]
				});
				aggValues[k]['n']++
			}
		}
	});
	return aggValues;
}

export const aggregateNestedArray = (arr) => {
	const map = {};
	arr.forEach(i => {
		i.forEach(j => {
			if (!map[j]) {
				map[j] = 1;
			} else {
				map[j]++;
			}
		});
	});
	return map;
}

export const combineAndAggregateNestedArray = (combKeys, arr) => {
	const map = {};
	combKeys.forEach((d, i) => {
		let entries = arr[i];
		if (!map[d]) {
			map[d] = {};
		}
		if (entries) {
			entries.forEach(entry => {
				if (!map[d][entry]) {
						map[d][entry] = 1;
					} else {
						map[d][entry]++
					}			
			});
		}
	});

	return map;
}

export const combineDailyGenres = (dayMap) => {
	const map = {};
	Object.keys(dayMap).forEach(day => {
		const entry = dayMap[day]
		if (entry.artist_meta) {
			const genres = Object.keys(entry.artist_meta.genres).forEach(genre => {
				if (!map[genre]) {
					map[genre] = entry.artist_meta.genres[genre]
				} else {
					map[genre] += entry.artist_meta.genres[genre]
				}
		})
		}
	})
	return map;
}

export const normalize = (arr, bounds) => {
	const normalized = {};
	Object.keys(arr).forEach(k => {
			const obj = arr[k]
			if (!normalized[k]) {
				normalized[k] = {};
			}
			Object.keys(bounds).forEach(f => {
				const fMin = bounds[f].min;
				const fMax = bounds[f].max
				normalized[k][f] = ((obj[f] / obj.n) - fMin) / (fMax - fMin);
			});
	});
	return normalized
}