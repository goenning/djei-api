[![Build Status](https://travis-ci.org/goenning/djei-api.svg?branch=master)](https://travis-ci.org/goenning/djei-api)

# What is this?

DJEI (Department of Jobs, Enterprise and Innovation) in Republic of Ireland publishes on a daily basis an update on **current processing dates** for Employment Permits.

**djei-api** pulls all these data from [DJEI official website](https://www.djei.ie/en/What-We-Do/Jobs-Workplace-and-Skills/Employment-Permits/Current-Application-Processing-Dates/) and make it available for you.

# Documentation

**https://api.djei.goenning.net/now** 

Fetches **current** dates from DJEI official website. A live pull is performed, hence it's slower than other methods.

**https://api.djei.goenning.net/{date}?interval={interval}&format={format}**

- {date} is **required** and formatted as YYYY-MM-DD
- {interval} specifies the range of days to retrieve. Interval is optional and defaults to **0**. Value must be between **-30** and **30**.
- {format} is optional and can be either **raw** or **date**. Defaults to **date**.

This operation returns processing date for given **{date}** in the past. Future dates should not be used for obvious reasons 🤓

**Examples:**

- https://api.djei.goenning.net/2017-05-16?interval=-1 Retrieves 2017-05-16 and 2017-05-15
- https://api.djei.goenning.net/2017-05-14?interval=2 Retrieves 2017-05-14, 2017-05-15 and 2017-05-16
- https://api.djei.goenning.net/2017-05-14?format=raw Retrieves 2017-05-14 with dates in epoch format.

### Don't abuse, plea$e.
