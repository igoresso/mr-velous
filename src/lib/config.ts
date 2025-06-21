export const DICOM_TAGS = {
	PatientName: '0010|0010',
	PatientID: '0010|0020',
	PatientBirthDate: '0010|0030',
	PatientSex: '0010|0040',
	StudyDate: '0008|0020',
	StudyTime: '0008|0030',
	Modality: '0008|0060',
	StudyDescription: '0008|1030',
	SeriesDescription: '0008|103E',
	StudyInstanceUID: '0020|000D'
} as const;

export const DICOM_TAGS_VISIBLE = {
	PatientName: '0010|0010',
	PatientID: '0010|0020',
	PatientBirthDate: '0010|0030',
	PatientSex: '0010|0040',
	StudyDate: '0008|0020',
	Modality: '0008|0060'
} as const;
