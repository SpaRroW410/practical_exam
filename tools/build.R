# ============================================================
# Community Medicine Examination System
# Build Script
#
# Reads QuestionBank.xlsx
# Creates:
#   data/questions.json
#   data/settings.json
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

questions <- list(

    clinical = as.data.frame(clinical),

    epidemiology = as.data.frame(epidemiology),

    biostatistics = as.data.frame(biostatistics),

    ospe = as.data.frame(ospe),

    spotter = as.data.frame(spotter)

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