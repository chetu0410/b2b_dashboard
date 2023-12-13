class QueryParam {
	get(key) {
		const search = window.location.search;
		const params = new URLSearchParams(search);
		return params.get(key);
	}

	getAll(key) {
		const search = window.location.search;
		const params = new URLSearchParams(search);
		return params.getAll(key);
	}
}

const QueryParams = new QueryParam();

export default QueryParams;
