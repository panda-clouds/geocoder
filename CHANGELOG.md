## PCGeocoder Changelog

### 1.13.0
- Added requiresFullAddress and defaulted to true

### 1.12.0
- Added google support by porting administrative area to state

### 1.11.0
- depreciated "search" in favor of "first"
- added "find"
- added catch for clear error handling of "429 Too Many Requests"

### 1.10.0

- added city validation
- migrated Promises > async/await

### 1.9.0

- switched to "Panda Clouds ESLint Config"
- switched to Jest
- added house number verification

### 1.8.1

- bumped formatter to 2.4.2

### 1.8.0

- bumped formatter to 2.4.1
- added failure if provided zipcode and user input zipcode don't match

### 1.7.0

- bumped formatter to 2.4.0

### 1.6.0

- bumped formatter to 2.3.0

### 1.5.0

- added graceful failing when a house number isnt returned

### 1.4.0

- unified "street" results with address-formatter

### 1.3.0

- changed address to single instread of array of results

### 1.2.0

- removed datasciencetoolkit
- tripple try openstreetmap

### 1.1.0

- changed zip to zipcode