# ============================================================
# Community Medicine Examination System
# Build Script
#
# Reads QuestionBank.xlsx
# Creates:
#   data/questions.json
#   data/settings.json
#
# DEPRECATED (fallback only): "Rebuild Data.html" at the repo root is
# now the primary way to regenerate these files — it runs entirely in
# the browser (no R, no packages, no install) and its output has been
# validated field-by-field against this script's, including the
# Settings-sheet-to-string coercion and the Answer_Key_A/B/C null-fill
# below. Kept here only in case R happens to be more convenient to
# reach for; if the two ever disagree, trust Rebuild Data.html.
#
# ============================================================

library(readxl)
library(jsonlite)

#-------------------------------------------------------------
# Configuration
#-------------------------------------------------------------

workbook <- "QuestionBank.xlsx"

output_folder <- "data"

if (!dir.exists(output_folder)) {
  dir.create(output_folder)
}

#-------------------------------------------------------------
# Read Workbook
#-------------------------------------------------------------

clinical <- read_excel(workbook, sheet = "Clinical_Case")

epidemiology <- read_excel(workbook, sheet = "Epidemiology")

biostatistics <- read_excel(workbook, sheet = "Biostatistics")

ospe <- read_excel(workbook, sheet = "OSPE")

spotter <- read_excel(workbook, sheet = "Spotter")

settings <- read_excel(workbook, sheet = "Settings")

#-------------------------------------------------------------
# Convert to Lists
#-------------------------------------------------------------

ensure_answer_keys <- function(df) {
  answer_keys <- c("Answer_Key_A", "Answer_Key_B", "Answer_Key_C")
  missing_keys <- setdiff(answer_keys, names(df))
  for (key in missing_keys) {
    df[[key]] <- NA
  }
  df
}

questions <- list(

    clinical = ensure_answer_keys(as.data.frame(clinical)),

    epidemiology = ensure_answer_keys(as.data.frame(epidemiology)),

    biostatistics = ensure_answer_keys(as.data.frame(biostatistics)),

    ospe = ensure_answer_keys(as.data.frame(ospe)),

    spotter = ensure_answer_keys(as.data.frame(spotter))

)

#-------------------------------------------------------------
# Write JSON
#-------------------------------------------------------------

write_json(
  questions,
  file.path(output_folder, "questions.json"),
  pretty = TRUE,
  auto_unbox = TRUE,
  na = "null"
)

#-------------------------------------------------------------
# Convert Settings to Named List
#-------------------------------------------------------------

settings_list <- as.list(settings$Value)
names(settings_list) <- settings$Parameter

write_json(
  settings_list,
  file.path(output_folder, "settings.json"),
  pretty = TRUE,
  auto_unbox = TRUE,
  na = "null"
)

cat("\n")
cat("=====================================\n")
cat(" Build Completed Successfully\n")
cat("=====================================\n")
cat("Clinical       :", nrow(clinical), "\n")
cat("Epidemiology   :", nrow(epidemiology), "\n")
cat("Biostatistics  :", nrow(biostatistics), "\n")
cat("OSPE           :", nrow(ospe), "\n")
cat("Spotter Slides :", nrow(spotter), "\n")
cat("\n")
cat("Files Created\n")
cat("-------------\n")
cat("data/questions.json\n")
cat("data/settings.json\n")
cat("\n")