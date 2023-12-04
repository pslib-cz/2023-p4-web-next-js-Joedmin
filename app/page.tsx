"use client";
import { classNames } from "primereact/utils";
import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { Toolbar } from "primereact/toolbar";
import { ProgressSpinner } from "primereact/progressspinner";
import Navbar from "./components/Navbar";
import Device from "./models/Device";

export default function Home() {
	let emptyDevice: Device = {
		id: null,
		serial_number: "",
		product_id: "",
		createdAt: null,
	};

	const [devices, setDevices] = useState<Device[]>([]);
	const [deviceDialog, setDeviceDialog] = useState<boolean>(false);
	const [deleteDeviceDialog, setDeleteDeviceDialog] = useState<boolean>(false);
	const [device, setDevice] = useState<Device>(emptyDevice);
	const [submitted, setSubmitted] = useState<boolean>(false);
	const dt = useRef<DataTable<Device[]>>(null);
	const toast = useRef<Toast>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch("/api/devices")
			.then((response) => response.json())
			.then((data) => {
				setDevices(data);
				setLoading(false);
				if (data.message) {
					toast.current?.show({ severity: "error", summary: "Error", detail: data.message, life: 3000 });
				}
			});
	}, []);

	const confirmDeleteDevice = (device: Device) => {
		setDevice(device);
		setDeleteDeviceDialog(true);
	};

	const deleteDevice = () => {
		setLoading(true);
		var status = 200;
		fetch(`/api/devices`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ id: device.id }),
		})
			.then((response) => {
				status = response.status;
				return response.json();
			})
			.then((deletedDevice) => {
				setDevices(devices.filter((device) => device.id !== deletedDevice.id));
				fetch("/api/devices")
					.then((response) => {
						status = response.status;
						return response.json();
					})
					.then((data) => {
						setDevices(data);
						setLoading(false);
						if (data.message) {
							toast.current?.show({
								severity: "error",
								summary: "Error",
								detail: data.message,
								life: 3000,
							});
						}
					});
				hideDeleteDeviceDialog();
				if (status != 200) {
					toast.current?.show({
						severity: "error",
						summary: "Error",
						detail: deletedDevice.message,
						life: 3000,
					});
				} else {
					toast.current?.show({
						severity: "success",
						summary: "Successful",
						detail: deletedDevice.message,
						life: 3000,
					});
				}
			});
	};

	const hideDeleteDeviceDialog = () => {
		setDeleteDeviceDialog(false);
	};

	const actionBodyTemplate = (rowData: Device) => {
		return (
			<>
				<Button
					icon="pi pi-trash"
					rounded
					outlined
					severity="danger"
					onClick={() => confirmDeleteDevice(rowData)}
				/>
			</>
		);
	};

	const onInputChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
		const val = (e.target && e.target.value) || "";
		let _device = { ...device };

		// @ts-ignore
		_device[`${name}`] = val;

		setDevice(_device);
	};

	const deleteDeviceDialogFooter = (
		<React.Fragment>
			<Button label="No" icon="pi pi-times" outlined onClick={hideDeleteDeviceDialog} />
			<Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteDevice} />
		</React.Fragment>
	);

	const openNew = () => {
		setDevice(emptyDevice);
		setSubmitted(false);
		setDeviceDialog(true);
	};

	const saveDevice = () => {
		setSubmitted(true);
		setLoading(true);

		fetch("/api/devices", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ serial_number: device.serial_number, product_id: device.product_id }),
		})
			.then((response) => response.json())
			.then((createdDevice) => {
				setDevices([...devices, createdDevice]);
				setDevice({ id: "", serial_number: "", product_id: "", createdAt: null });
				fetch("/api/devices")
					.then((response) => response.json())
					.then((data) => {
						setDevices(data);
						setLoading(false);
						if (data.message) {
							toast.current?.show({
								severity: "error",
								summary: "Error",
								detail: data.message,
								life: 3000,
							});
						}
					});
				hideDialog();
				if (createdDevice.id) {
					toast.current?.show({
						severity: "success",
						summary: "Successful",
						detail: "Device Created: " + createdDevice.id,
						life: 3000,
					});
				} else {
					toast.current?.show({
						severity: "error",
						summary: "Error",
						detail: createdDevice.message,
						life: 3000,
					});
				}
			});
	};

	const hideDialog = () => {
		setSubmitted(false);
		setDeviceDialog(false);
	};

	const leftToolbarTemplate = () => {
		return (
			<div className="flex flex-wrap gap-2">
				<Button label="New" icon="pi pi-plus" severity="success" onClick={openNew} />
			</div>
		);
	};

	const deviceDialogFooter = (
		<React.Fragment>
			<Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
			<Button label="Save" icon="pi pi-check" onClick={saveDevice} />
		</React.Fragment>
	);

	return (
		<>
			<Navbar />
			<div className="m-3">
				<div className="row">
					<div className="flex-auto w-full">
						<h1>Devices</h1>
						<Toast ref={toast} />
						<div className="card">
							{loading ? (
								<div className="flex justify-content-center flex-wrap">
									<ProgressSpinner
										style={{ width: "50px", height: "50px" }}
										strokeWidth="8"
										fill="var(--surface-ground)"
										animationDuration=".5s"
									/>
								</div>
							) : (
								<div>
									<Toolbar className="mb-4" left={leftToolbarTemplate}></Toolbar>
									<DataTable
										ref={dt}
										value={devices}
										dataKey="id"
										paginator
										rows={5}
										rowsPerPageOptions={[5, 10, 25]}
										paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
										currentPageReportTemplate="Showing {first} to {last} of {totalRecords} devices">
										<Column field="serial_number" header="Serial Number" sortable></Column>
										<Column field="product_id" header="Product ID" sortable></Column>
										<Column field="createdAt" header="Created" sortable></Column>
										<Column body={actionBodyTemplate} exportable={false}></Column>
									</DataTable>
								</div>
							)}
						</div>
						<Dialog
							visible={deviceDialog}
							style={{ width: "32rem" }}
							breakpoints={{ "960px": "75vw", "641px": "90vw" }}
							header="Device Details"
							modal
							className="p-fluid"
							footer={deviceDialogFooter}
							onHide={hideDialog}>
							<div className="field">
								<label htmlFor="serial_number" className="font-bold">
									Serial Number
								</label>
								<InputText
									id="serial_number"
									value={device.serial_number}
									onChange={(e) => onInputChange(e, "serial_number")}
									required
									autoFocus
									className={classNames({ "p-invalid": submitted && !device.serial_number })}
								/>
								{submitted && !device.serial_number && (
									<small className="p-error">Serial Number is required.</small>
								)}
							</div>
							<div className="field">
								<label htmlFor="product_id" className="font-bold">
									Product ID
								</label>
								<InputText
									id="product_id"
									value={device.product_id}
									onChange={(e) => onInputChange(e, "product_id")}
									required
									className={classNames({ "p-invalid": submitted && !device.product_id })}
								/>
								{submitted && !device.product_id && (
									<small className="p-error">Product ID is required.</small>
								)}
							</div>
						</Dialog>
						<Dialog
							visible={deleteDeviceDialog}
							style={{ width: "32rem" }}
							breakpoints={{ "960px": "75vw", "641px": "90vw" }}
							header="Confirm"
							modal
							footer={deleteDeviceDialogFooter}
							onHide={hideDeleteDeviceDialog}>
							<div className="confirmation-content">
								<i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: "2rem" }} />
								{device && (
									<span>
										Are you sure you want to delete <b>{device.serial_number}</b>?
									</span>
								)}
							</div>
						</Dialog>
					</div>
				</div>
			</div>
		</>
	);
}
