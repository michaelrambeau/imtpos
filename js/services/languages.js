/*
This file contains services and directives related to translations:
- "WimsData", Languages" and "Translations" services
- "etext" and etextid" services
*/



app.factory('Languages', function() {
	var languages = [
			{
				number: 1,
				value: 'por',
				label: 'Português'
			},
			{
				number: 2,
				value: 'esp',
				label: 'Español'
			},
			{
				number: 3,
				value: 'jpn',
				label: '日本語'
			},
			{
				number: 4,
				value: 'eng',
				label: 'English'
			},
			{
				number: 5,
				value: 'tag',
				label: 'Tagalog'
			},
			{
				number: 6,
				value: 'chi',
				label: '中國語'
			},
			{
				number: 7,
				value: 'kor',
				label: '한국어'
			},
			{
				number: 8,
				value: 'tha',
				label: 'ไทย'
			},
			{
				number: 9,
				value: 'rus',
				label: 'Русский'
			},
			{
				number: 15,
				value: 'vie',
				label: 'Tiếng Việt'
			},
			{
				number: 16,
				value: 'ind',
				label: 'Bahasa Indonesia'
			}
	 ];

	return {
		getAll: function () {
			return languages;
		}
	};
});
