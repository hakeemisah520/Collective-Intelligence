;; Collective Intelligence Platform

;; Constants
(define-constant ERR_NOT_FOUND (err u404))
(define-constant ERR_UNAUTHORIZED (err u403))

;; Data vars
(define-data-var problem-counter uint u0)
(define-data-var solution-counter uint u0)

;; Maps
(define-map problems
  { id: uint }
  { creator: principal, title: (string-ascii 100), description: (string-ascii 1000), bounty: uint, status: (string-ascii 20) })

(define-map solutions
  { id: uint }
  { problem-id: uint, creator: principal, content: (string-ascii 2000), votes: uint })

;; Functions
(define-public (submit-problem (title (string-ascii 100)) (description (string-ascii 1000)) (bounty uint))
  (let ((problem-id (+ (var-get problem-counter) u1)))
    (try! (stx-transfer? bounty tx-sender (as-contract tx-sender)))
    (map-set problems
      { id: problem-id }
      { creator: tx-sender, title: title, description: description, bounty: bounty, status: "open" })
    (var-set problem-counter problem-id)
    (ok problem-id)))

(define-public (propose-solution (problem-id uint) (content (string-ascii 2000)))
  (let ((solution-id (+ (var-get solution-counter) u1)))
    (map-set solutions
      { id: solution-id }
      { problem-id: problem-id, creator: tx-sender, content: content, votes: u0 })
    (var-set solution-counter solution-id)
    (ok solution-id)))

(define-public (vote-solution (solution-id uint))
  (match (map-get? solutions { id: solution-id })
    solution (begin
      (map-set solutions
        { id: solution-id }
        (merge solution { votes: (+ (get votes solution) u1) }))
      (ok true))
    (err ERR_NOT_FOUND)))

(define-public (close-problem (problem-id uint))
  (match (map-get? problems { id: problem-id })
    problem (if (is-eq (get creator problem) tx-sender)
              (begin
                (map-set problems
                  { id: problem-id }
                  (merge problem { status: "closed" }))
                (ok true))
              (err ERR_UNAUTHORIZED))
    (err ERR_NOT_FOUND)))

(define-read-only (get-problem (problem-id uint))
  (map-get? problems { id: problem-id }))

(define-read-only (get-solution (solution-id uint))
  (map-get? solutions { id: solution-id }))

