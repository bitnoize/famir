function testStatusRange(status: number, min: number, max: number): boolean {
  return status >= min && status < max
}

export function isStatusInformation(status: number): boolean {
  return testStatusRange(status, 100, 200)
}

export function isStatusSuccess(status: number): boolean {
  return testStatusRange(status, 200, 300)
}

export function isStatusRedirect(status: number): boolean {
  return testStatusRange(status, 300, 400)
}

export function isStatusClientError(status: number): boolean {
  return testStatusRange(status, 400, 500)
}

export function isStatusServerError(status: number): boolean {
  return testStatusRange(status, 500, 600)
}

export function isStatusUnknown(status: number): boolean {
  return !testStatusRange(status, 100, 600)
}
