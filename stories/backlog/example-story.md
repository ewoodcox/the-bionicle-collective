# [STORY-001] Example: Improve Collection Page Loading

**Status:** Backlog  
**Priority:** Medium  
**Story Points:** 3  
**Created:** 2025-03-14  

---

## User Story

**As a** collector browsing the site  
**I want** collection pages to load quickly  
**So that** I don't lose interest while waiting  

---

## Acceptance Criteria

- [ ] Collection list page loads in under 2 seconds on a typical connection
- [ ] Set detail pages show skeleton/loading state while data loads
- [ ] Images use lazy loading where appropriate
- [ ] No layout shift (CLS) during load

---

## Notes

- Consider R2/API response caching
- May need to audit image sizes and formats

---

## Definition of Done

- [ ] Code merged to main
- [ ] Tested in preview deployment
- [ ] No new console errors or warnings
