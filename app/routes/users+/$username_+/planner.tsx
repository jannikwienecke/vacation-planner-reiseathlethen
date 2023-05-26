import { json, type DataFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { GeneralErrorBoundary } from '~/components/error-boundary.tsx'
import { prisma } from '~/utils/db.server.ts'
// import { clsx } from 'clsx'
// import { getUserImgSrc } from '~/utils/misc.ts'
import { Dialog, Transition } from '@headlessui/react'
import { addDays } from 'date-fns'
import { Fragment } from 'react'
import { DateRange, DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { BottomSheet, BottomSheetRef } from 'react-spring-bottom-sheet'
import { requireUserId } from '~/utils/auth.server.ts'
// import { CheckIcon } from '@heroicons/react/24/outline'
import React from 'react'
import styles from './planner.css'

export function links() {
	return [{ rel: 'stylesheet', href: styles }]
}

export async function loader({ params, request }: DataFunctionArgs) {
	await requireUserId(request, { redirectTo: null })
	const owner = await prisma.user.findUnique({
		where: {
			username: params.username,
		},
		select: {
			id: true,
			username: true,
			name: true,
			imageId: true,
		},
	})
	if (!owner) {
		throw new Response('Not found', { status: 404 })
	}
	const notes = await prisma.note.findMany({
		where: {
			ownerId: owner.id,
		},
		select: {
			id: true,
			title: true,
		},
	})
	return json({ owner, notes })
}

const pastMonth = new Date(2023, 4, 5)

export default function NotesRoute() {
	const data = useLoaderData<typeof loader>()
	const ownerDisplayName = data.owner.name ?? data.owner.username
	const navLinkDefaultClassName =
		'line-clamp-2 block rounded-l-full py-2 pl-8 pr-6 text-base lg:text-xl'

	const defaultSelected: DateRange = {
		from: pastMonth,
		to: addDays(pastMonth, 4),
	}
	const [range, _] = React.useState<DateRange | undefined>(defaultSelected)

	const [isOpen, setIsOpen] = React.useState(false)
	const handleClickActivity = (activity: string) => {
		setIsOpen(true)
	}

	const handleCloseModal = () => {
		console.log('CLOSE MODAL')
		setIsOpen(false)
	}

	console.log('isOpen: ', isOpen)
	return (
		<div className="flex h-full flex-col pb-12">
			<Modal onClose={handleCloseModal} isOpen={isOpen} />

			<div
				// center
				className=" flex flex-row items-center justify-center"
			>
				<DayPicker
					className="rdp"
					onDayClick={() => {
						console.log('clicked')
					}}
					selected={range}
				/>
				;
			</div>
			{/* <DatePicker value={dayRange} onChange={setDayRange} /> */}
			<div className="mx-auto w-full flex-grow pl-2 md:container md:rounded-3xl">
				<div className="flex flex-row space-x-4 px-4 pt-4">
					<div className="grid place-items-center rounded-xl bg-purple-200 p-2">
						<RocketIcon />
					</div>
					<h1 className="text-center text-3xl font-bold">Activity Planner</h1>
				</div>

				{/* CARD LIST */}
				<ul className="flex flex-col gap-4 px-2 pt-6">
					{[1, 2, 3].map((item, index) => {
						return (
							<li key={index} className="px-2">
								<CardItem
									onClick={() => handleClickActivity('fitness')}
									key={index}
								/>
							</li>
						)
					})}
				</ul>
			</div>
		</div>
	)
}

const CardItem = ({ onClick }: { onClick: () => void }) => {
	return (
		<button
			onClick={onClick}
			className="flex w-full flex-col gap-3 rounded-2xl border-[1px] border-night-700 p-2 px-3"
		>
			{/* title and settings button ... (three dots) */}
			<div className="flex flex-row justify-between ">
				<h2 className="text-md font-bold">Dashboard design for admin</h2>

				<div>
					<button className="rounded-full p-1 hover:bg-night-700/10">
						<SettingsIcon />
					</button>
				</div>
			</div>

			{/* tags */}
			<div className="flex flex-row gap-2">
				<Badge color="bg-red-200">Fun</Badge>
				<Badge color="bg-green-200">Health</Badge>
			</div>

			{/* meta */}
			<div className="flex flex-row items-center justify-between gap-2">
				<div className="flex flex-row items-center gap-1">
					<div>
						<CalendarIcon className="h-4 w-4" />
					</div>
					<p className="text-xs ">14 october 2022</p>
				</div>

				{/* dsa */}
				<div></div>
			</div>

			{/*  */}
		</button>
	)
}

const SettingsIcon = () => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			className="h-6 w-6"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
			/>
		</svg>
	)
}

const CalendarIcon = ({ className }: { className?: string }) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			className={'h-6 w-6' + className}
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"
			/>
		</svg>
	)
}

const RocketIcon = () => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			className="h-6 w-6"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
			/>
		</svg>
	)
}

const Badge = ({
	color,
	children,
}: {
	color?: string
	children: React.ReactNode
}) => {
	return (
		<span
			className={`${color} inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-night-700 ring-1 ring-inset ring-gray-500/10`}
		>
			{children}
		</span>
	)
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: ({ params }) => (
					<p>No user with the username "{params.username}" exists</p>
				),
			}}
		/>
	)
}

const BottomSheetModal = () => {
	const [expandOnContentDrag, setExpandOnContentDrag] = React.useState(true)
	const focusRef = React.useRef<HTMLButtonElement>(null)
	const sheetRef = React.useRef<BottomSheetRef>(null)

	return (
		<BottomSheet
			open={true}
			skipInitialTransition
			// sibling={<CloseExample className="z-10" />}
			ref={sheetRef}
			initialFocusRef={focusRef}
			defaultSnap={({ maxHeight }) => maxHeight / 2}
			snapPoints={({ maxHeight }) => [
				maxHeight - maxHeight / 10,
				maxHeight / 4,
				maxHeight * 0.6,
			]}
			expandOnContentDrag={expandOnContentDrag}
		>
			<div className="bg-red-100">
				<div>BOTTOM SHEET</div>
				<button
					onClick={() => {
						// sheetRef.current?.snapTo(0)
						console.log(sheetRef.current?.height)

						sheetRef.current?.snapTo(({ maxHeight }) => {
							return 500
						})
					}}
				>
					OPEN
				</button>
			</div>
		</BottomSheet>
	)
}

const Modal = ({
	isOpen,
	onClose,
}: {
	isOpen: boolean
	onClose: () => void
}) => {
	const [open, setOpen] = React.useState(isOpen)

	const handleClose = () => {
		setOpen(false)
		onClose()
	}

	React.useEffect(() => {
		setOpen(isOpen)
	}, [isOpen])

	return (
		<Transition.Root show={open} as={Fragment}>
			<Dialog
				as="div"
				className="relative z-10"
				onClose={() => {
					console.log('close!!')

					handleClose()
				}}
			>
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
				</Transition.Child>

				<div className="fixed inset-0 z-10 overflow-y-auto">
					<div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-500"
							enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
							enterTo="opacity-100 translate-y-0 sm:scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 translate-y-0 sm:scale-100"
							leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
						>
							<Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
								<div>
									<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
										<RocketIcon />
									</div>
									<div className="mt-3 text-center sm:mt-5">
										<Dialog.Title
											as="h3"
											className="text-base font-semibold leading-6 text-gray-900"
										>
											Personal Training Session with Hans
										</Dialog.Title>
										<div className="mt-2">
											<p className="text-sm text-gray-500">
												{/* text about personal training */}
												Enjoy a one-on-one personal training session with our
												top trainer, Hans. Hans will work with you to develop a
												personalized training plan to help you achieve your
												fitness goals. Duration of the session is 1 hour. Please
												arrive 15 minutes before the start of your session.
											</p>
										</div>
									</div>

									<div className="px-2 pt-4">Please select a day and time</div>

									{/* Date time picker */}
									<div className="pt-2">
										<input
											type="datetime-local"
											className="block w-full rounded-md border border-gray-300 px-2 py-1 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
											defaultValue={new Date().toISOString().slice(0, 16)}
										/>
									</div>
								</div>
								<div className="mt-5 sm:mt-6">
									<button
										type="button"
										className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
										onClick={handleClose}
									>
										Go back to dashboard
									</button>
								</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition.Root>
	)
}
